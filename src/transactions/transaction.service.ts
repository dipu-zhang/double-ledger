import { randomUUID } from "crypto";
import { Account } from "../shared/entities/account";
import {
  Transaction,
  TransactionEntry,
} from "../shared/entities/transaction";
import { Direction } from "../shared/types/direction";
import { DEFAULT_CURRENCY } from "../shared/types/currency";
import {
  CreateTransactionRequest,
  CreateTransactionRequestEntry,
} from "./dtos/requests/create-transaction.request";
import { accountRepository } from "../shared/repositories/account-repository";
import { transactionRepository } from "../shared/repositories/transaction-repository";
import { NotFoundError } from "../shared/errors/not-found-error";
import { ValidationError } from "../shared/errors/validation-error";
import { ConflictError } from "../shared/errors/conflict-error";
import { accountService } from "../accounts/account.service";

class TransactionService {
  createTransaction(data: CreateTransactionRequest): Transaction {
    const transactionId = data.id || randomUUID();

    if (data.id) {
      const existingTransaction = this.checkIdempotency(transactionId, data);
      if (existingTransaction) {
        return existingTransaction;
      }
    }

    const entries: TransactionEntry[] = data.entries.map((entryReq) => {
      const account = accountRepository.findById(entryReq.accountId);
      const entryCurrency = entryReq.currency ?? account?.currency ?? DEFAULT_CURRENCY;

      return {
        id: entryReq.id ?? randomUUID(),
        accountId: entryReq.accountId,
        direction: entryReq.direction,
        amount: entryReq.amount,
        currency: entryCurrency,
      };
    });

    const transaction: Transaction = {
      id: transactionId,
      name: data.name ?? "",
      entries,
      createdAt: new Date().toISOString(),
    };

    this.validateTransaction(transaction);
    const balanceChanges = this.calculateBalanceChanges(transaction.entries);
    this.applyBalanceChanges(balanceChanges);

    transactionRepository.create(transaction);

    return transaction;
  }

  private validateTransaction(transaction: Transaction): void {
    const entries = transaction.entries;

    if (entries.length < 2) {
      throw new ValidationError("Transaction must have at least 2 entries");
    }

    let hasDebit = false;
    let hasCredit = false;
    let debitSum = 0;
    let creditSum = 0;
    const currencies = new Set<string>();

    for (const entry of entries) {
      const account = accountRepository.findById(entry.accountId);
      if (!account) {
        throw new NotFoundError(`Account not found: ${entry.accountId}`);
      }

      if (entry.currency !== account.currency) {
        throw new ValidationError(
          `Entry currency ${entry.currency} does not match account currency ${account.currency} for account ${entry.accountId}`,
        );
      }

      currencies.add(entry.currency);

      if (entry.direction === Direction.DEBIT) {
        hasDebit = true;
        debitSum += entry.amount;
      } else {
        hasCredit = true;
        creditSum += entry.amount;
      }
    }

    if (currencies.size > 1) {
      throw new ValidationError(
        `Transaction cannot mix currencies: ${Array.from(currencies).join(", ")}`,
      );
    }

    if (!hasDebit || !hasCredit) {
      throw new ValidationError(
        "Transaction must have at least one debit and one credit entry",
      );
    }

    if (debitSum !== creditSum) {
      throw new ValidationError(
        `Transaction must be balanced: debits=${debitSum}, credits=${creditSum}`,
      );
    }
  }

  private calculateBalanceChanges(
    entries: TransactionEntry[],
  ): Map<string, number> {
    const balanceChanges = new Map<string, number>();
    const accounts = new Map<string, Account>();

    for (const entry of entries) {
      if (!accounts.has(entry.accountId)) {
        const account = accountRepository.findById(entry.accountId)!;
        accounts.set(entry.accountId, account);
      }

      const account = accounts.get(entry.accountId)!;
      const currentChange = balanceChanges.get(entry.accountId) || 0;

      if (account.direction === entry.direction) {
        balanceChanges.set(entry.accountId, currentChange + entry.amount);
      } else {
        balanceChanges.set(entry.accountId, currentChange - entry.amount);
      }
    }

    return balanceChanges;
  }

  private applyBalanceChanges(balanceChanges: Map<string, number>): void {
    for (const [accountId, change] of balanceChanges) {
      accountService.updateAccountBalance(accountId, change);
    }
  }

  private checkIdempotency(
    id: string,
    newRequest: CreateTransactionRequest,
  ): Transaction | null {
    const existingTransaction = transactionRepository.findById(id);
    if (!existingTransaction) {
      return null;
    }

    const normalizedExisting =
      this.normalizeTransactionForIdempotency(existingTransaction);
    const normalizedNew = this.normalizeTransactionForIdempotency({
      id,
      name: newRequest.name ?? "",
      entries: newRequest.entries.map((e) => {
        const account = accountRepository.findById(e.accountId);
        const entryCurrency = e.currency ?? account?.currency ?? DEFAULT_CURRENCY;

        return {
          id: "",
          accountId: e.accountId,
          direction: e.direction,
          amount: e.amount,
          currency: entryCurrency,
        };
      }),
      createdAt: "",
    });

    if (JSON.stringify(normalizedExisting) === JSON.stringify(normalizedNew)) {
      return existingTransaction;
    }

    throw new ConflictError(
      `Transaction with id ${id} already exists with different data`,
    );
  }

  private normalizeTransactionForIdempotency(transaction: Transaction): any {
    const sortedEntries = transaction.entries
      .map((e) => ({
        accountId: e.accountId,
        direction: e.direction,
        amount: e.amount,
        currency: e.currency,
      }))
      .sort((a, b) => {
        if (a.accountId !== b.accountId) {
          return a.accountId.localeCompare(b.accountId);
        }
        if (a.direction !== b.direction) {
          return a.direction.localeCompare(b.direction);
        }
        if (a.currency !== b.currency) {
          return a.currency.localeCompare(b.currency);
        }
        return a.amount - b.amount;
      });

    return {
      name: transaction.name || null,
      entries: sortedEntries,
    };
  }
}

export const transactionService = new TransactionService();
