import { Transaction } from "../../shared/entities/transaction";
import { TransactionResponse } from "../dtos/responses/transaction.response";

class CreateTransactionResponsePresenter {
  present(transaction: Transaction): TransactionResponse {
    return {
      id: transaction.id,
      name: transaction.name,
      entries: transaction.entries.map((entry) => ({
        id: entry.id,
        account_id: entry.accountId,
        direction: entry.direction,
        amount: entry.amount,
        currency: entry.currency,
      })),
      created_at: transaction.createdAt,
    };
  }
}

export const createTransactionResponsePresenter =
  new CreateTransactionResponsePresenter();
