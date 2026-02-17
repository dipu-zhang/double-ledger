import { Transaction } from "../entities/transaction";
import { ConflictError } from "../errors/conflict-error";

class TransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  create(transaction: Transaction): Transaction {
    if (this.transactions.has(transaction.id)) {
      throw new ConflictError(
        `Transaction with id ${transaction.id} already exists`,
      );
    }
    this.transactions.set(transaction.id, transaction);
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
  }
}

export const transactionRepository = new TransactionRepository();
