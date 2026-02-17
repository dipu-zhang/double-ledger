import { createTransactionResponsePresenter } from "../../../../src/transactions/presenters/create-transaction-response.presenter";
import { Transaction } from "../../../../src/shared/entities/transaction";
import { Direction } from "../../../../src/shared/types/direction";
import { Currency } from "../../../../src/shared/types/currency";

describe("CreateTransactionResponsePresenter", () => {
  it("maps transaction entity to response DTO", () => {
    const transaction: Transaction = {
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "Payment",
      createdAt: "2026-02-16T10:00:00.000Z",
      entries: [
        {
          id: "entry-1",
          accountId: "acc-1",
          direction: Direction.DEBIT,
          amount: 10000,
          currency: Currency.USD,
        },
        {
          id: "entry-2",
          accountId: "acc-2",
          direction: Direction.CREDIT,
          amount: 10000,
          currency: Currency.USD,
        },
      ],
    };

    expect(createTransactionResponsePresenter.present(transaction)).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "Payment",
      created_at: "2026-02-16T10:00:00.000Z",
      entries: [
        {
          id: "entry-1",
          account_id: "acc-1",
          direction: Direction.DEBIT,
          amount: 10000,
          currency: Currency.USD,
        },
        {
          id: "entry-2",
          account_id: "acc-2",
          direction: Direction.CREDIT,
          amount: 10000,
          currency: Currency.USD,
        },
      ],
    });
  });
});
