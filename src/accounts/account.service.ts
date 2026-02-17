import { randomUUID } from "crypto";
import { Account } from "../shared/entities/account";
import { CreateAccountRequest } from "./dtos/requests/create-account.request";
import { accountRepository } from "../shared/repositories/account-repository";
import { DEFAULT_CURRENCY, Currency } from "../shared/types/currency";
import { NotFoundError } from "../shared/errors/not-found-error";
import { ConflictError } from "../shared/errors/conflict-error";

class AccountService {
  createAccount(data: CreateAccountRequest): Account {
    const accountId = data.id || randomUUID();

    if (accountRepository.findById(accountId)) {
      throw new ConflictError(`Account with id ${accountId} already exists`);
    }

    const account: Account = {
      id: accountId,
      name: data.name ?? "",
      direction: data.direction,
      balance: data.balance ?? 0,
      currency: data.currency ?? DEFAULT_CURRENCY,
    };

    return accountRepository.create(account);
  }

  getAccount(id: string): Account {
    const account = accountRepository.findById(id);
    if (!account) {
      throw new NotFoundError(`Account not found: ${id}`);
    }
    return account;
  }

  updateAccountBalance(accountId: string, delta: number): void {
    const account = accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundError(`Account not found: ${accountId}`);
    }

    accountRepository.update(accountId, {
      balance: account.balance + delta,
    });
  }
}

export const accountService = new AccountService();
