import { Transaction } from "../entities/transaction";
import { ConflictError } from "../errors/conflict-error";

class TransactionRepository {
  private transactions: Map<string, Transaction> = new Map();
  private entryIds: Set<string> = new Set();

  create(transaction: Transaction): Transaction {
    if (this.transactions.has(transaction.id)) {
      throw new ConflictError(
        `Transaction with id ${transaction.id} already exists`,
      );
    }
    const entryIdsInTransaction = new Set<string>();
    for (const entry of transaction.entries) {
      if (entryIdsInTransaction.has(entry.id)) {
        throw new ConflictError(
          `Entry with id ${entry.id} already exists`,
        );
      }
      entryIdsInTransaction.add(entry.id);
      if (this.entryIds.has(entry.id)) {
        throw new ConflictError(
          `Entry with id ${entry.id} already exists`,
        );
      }
    }
    this.transactions.set(transaction.id, transaction);
    for (const entry of transaction.entries) {
      this.entryIds.add(entry.id);
    }
    return transaction;
  }

  findById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getAll(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  clear(): void {
    this.transactions.clear();
    this.entryIds.clear();
  }
}

export const transactionRepository = new TransactionRepository();
