import { transactionService } from "../../../src/transactions/transaction.service";
import { accountService } from "../../../src/accounts/account.service";
import { accountRepository } from "../../../src/shared/repositories/account-repository";
import { transactionRepository } from "../../../src/shared/repositories/transaction-repository";
import { Direction } from "../../../src/shared/types/direction";
import { Currency } from "../../../src/shared/types/currency";
import { jest } from "@jest/globals";

function fakeAccount(
  id: string,
  direction: Direction,
  balance = 0,
  currency: Currency = Currency.USD,
) {
  return {
    id,
    name: "",
    direction,
    balance,
    currency,
  };
}

describe("TransactionService", () => {
  beforeEach(() => {
    jest
      .spyOn(accountRepository, "findById")
      .mockImplementation((id: string) => {
        if (id === "cash")
          return fakeAccount("cash", Direction.DEBIT, 0, Currency.USD);
        if (id === "revenue")
          return fakeAccount("revenue", Direction.CREDIT, 0, Currency.USD);
        if (id === "expense")
          return fakeAccount("expense", Direction.DEBIT, 0, Currency.USD);
        return undefined;
      });
    jest
      .spyOn(transactionRepository, "create")
      .mockImplementation((tx: any) => tx);
    jest.spyOn(transactionRepository, "findById").mockReturnValue(undefined);
    jest
      .spyOn(accountService, "updateAccountBalance")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createTransaction", () => {
    it("should create balanced transaction", () => {
      const transaction = transactionService.createTransaction({
        entries: [
          {
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      });

      expect(transaction.id).toBeDefined();
      expect(transaction.entries).toHaveLength(2);
      expect(transaction.createdAt).toBeDefined();

      expect(accountRepository.findById).toHaveBeenCalledWith("cash");
      expect(accountRepository.findById).toHaveBeenCalledWith("revenue");
      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: transaction.id,
          name: "",
          entries: expect.arrayContaining([
            expect.objectContaining({
              accountId: "cash",
              direction: Direction.DEBIT,
              amount: 100,
            }),
            expect.objectContaining({
              accountId: "revenue",
              direction: Direction.CREDIT,
              amount: 100,
            }),
          ]),
        }),
      );
      expect(accountService.updateAccountBalance).toHaveBeenCalledWith(
        "cash",
        100,
      );
      expect(accountService.updateAccountBalance).toHaveBeenCalledWith(
        "revenue",
        100,
      );
    });

    it("should handle opposite direction entries", () => {
      transactionService.createTransaction({
        entries: [
          {
            accountId: "cash",
            direction: Direction.CREDIT,
            amount: 50,
          },
          {
            accountId: "expense",
            direction: Direction.DEBIT,
            amount: 50,
          },
        ],
      });

      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entries: expect.any(Array),
        }),
      );
      expect(accountService.updateAccountBalance).toHaveBeenCalledWith(
        "cash",
        -50,
      );
      expect(accountService.updateAccountBalance).toHaveBeenCalledWith(
        "expense",
        50,
      );
    });

    it("should reject transaction with less than 2 entries", () => {
      expect(() =>
        transactionService.createTransaction({
          entries: [
            {
              accountId: "cash",
              direction: Direction.DEBIT,
              amount: 100,
            },
          ],
        }),
      ).toThrow("Transaction must have at least 2 entries");

      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
    });

    it("should reject transaction without both debit and credit", () => {
      expect(() =>
        transactionService.createTransaction({
          entries: [
            {
              accountId: "cash",
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              accountId: "revenue",
              direction: Direction.DEBIT,
              amount: 100,
            },
          ],
        }),
      ).toThrow("Transaction must have at least one debit and one credit entry");

      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
    });

    it("should reject unbalanced transaction", () => {
      expect(() =>
        transactionService.createTransaction({
          entries: [
            {
              accountId: "cash",
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              accountId: "revenue",
              direction: Direction.CREDIT,
              amount: 50,
            },
          ],
        }),
      ).toThrow("Transaction must be balanced: debits=100, credits=50");

      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
    });

    it("should reject transaction with non-existent account", () => {
      expect(() =>
        transactionService.createTransaction({
          entries: [
            {
              accountId: "non-existent",
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              accountId: "revenue",
              direction: Direction.CREDIT,
              amount: 100,
            },
          ],
        }),
      ).toThrow("Account not found: non-existent");

      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
    });

    it("should not update balances if validation fails", () => {
      expect(() =>
        transactionService.createTransaction({
          entries: [
            {
              accountId: "cash",
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              accountId: "revenue",
              direction: Direction.CREDIT,
              amount: 50,
            },
          ],
        }),
      ).toThrow("Transaction must be balanced: debits=100, credits=50");

      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
    });
  });

  describe("idempotency", () => {
    it("should return existing transaction with same payload", () => {
      const request = {
        id: "550e8400-e29b-41d4-a716-446655440009",
        name: "Sale",
        entries: [
          {
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      };

      const tx1 = transactionService.createTransaction(request);

      expect(transactionRepository.create).toHaveBeenCalledTimes(1);
      expect(transactionRepository.findById).toHaveBeenCalledWith(request.id);

      const existingTx = {
        ...tx1,
        id: request.id,
        name: "Sale",
        entries: tx1.entries,
        createdAt: tx1.createdAt,
      };
      jest.spyOn(transactionRepository, "findById").mockReturnValue(existingTx);
      jest.spyOn(transactionRepository, "create").mockClear();
      jest.spyOn(accountService, "updateAccountBalance").mockClear();

      const tx2 = transactionService.createTransaction(request);

      expect(tx2.id).toBe(tx1.id);
      expect(tx2.createdAt).toBe(tx1.createdAt);
      expect(transactionRepository.create).not.toHaveBeenCalled();
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
    });

    it("should throw ConflictError with different payload", () => {
      transactionService.createTransaction({
        id: "550e8400-e29b-41d4-a716-446655440010",
        entries: [
          {
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      });

      const existingTx = {
        id: "550e8400-e29b-41d4-a716-446655440010",
        name: "",
        entries: [
          {
            id: "e1",
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
            currency: Currency.USD,
          },
          {
            id: "e2",
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
            currency: Currency.USD,
          },
        ],
        createdAt: new Date().toISOString(),
      };
      jest
        .spyOn(transactionRepository, "findById")
        .mockReturnValue(existingTx);

      expect(() =>
        transactionService.createTransaction({
          id: "550e8400-e29b-41d4-a716-446655440010",
          entries: [
            {
              accountId: "cash",
              direction: Direction.DEBIT,
              amount: 200,
            },
            {
              accountId: "revenue",
              direction: Direction.CREDIT,
              amount: 200,
            },
          ],
        }),
      ).toThrow(
        "Transaction with id 550e8400-e29b-41d4-a716-446655440010 already exists with different data",
      );

      expect(transactionRepository.findById).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440010",
      );
    });

    it("should not check idempotency if no id provided", () => {
      const tx1 = transactionService.createTransaction({
        entries: [
          {
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      });

      jest.spyOn(accountService, "updateAccountBalance").mockClear();

      const tx2 = transactionService.createTransaction({
        entries: [
          {
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      });

      expect(tx1.id).not.toBe(tx2.id);
      expect(transactionRepository.create).toHaveBeenCalledTimes(2);
    });

    it("should treat undefined and empty string name as equivalent for idempotency", () => {
      const tx1 = transactionService.createTransaction({
        id: "550e8400-e29b-41d4-a716-446655440011",
        entries: [
          {
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      });

      const existingTx = {
        id: "550e8400-e29b-41d4-a716-446655440011",
        name: "",
        entries: tx1.entries,
        createdAt: tx1.createdAt,
      };
      jest
        .spyOn(transactionRepository, "findById")
        .mockReturnValue(existingTx);
      jest.spyOn(transactionRepository, "create").mockClear();
      jest.spyOn(accountService, "updateAccountBalance").mockClear();

      const tx2 = transactionService.createTransaction({
        id: "550e8400-e29b-41d4-a716-446655440011",
        name: "",
        entries: [
          {
            accountId: "cash",
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            accountId: "revenue",
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      });

      expect(tx2.id).toBe(tx1.id);
      expect(tx2.createdAt).toBe(tx1.createdAt);
      expect(transactionRepository.create).not.toHaveBeenCalled();
    });
  });
});
