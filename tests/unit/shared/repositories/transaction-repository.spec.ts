import { transactionRepository } from "../../../../src/shared/repositories/transaction-repository";
import { Transaction } from "../../../../src/shared/entities/transaction";
import { Direction } from "../../../../src/shared/types/direction";
import { Currency } from "../../../../src/shared/types/currency";

describe("TransactionRepository", () => {
  afterEach(() => {
    transactionRepository.clear();
  });

  describe("create", () => {
    it("should create and store transaction", () => {
      const transaction: Transaction = {
        id: "550e8400-e29b-41d4-a716-446655440001",
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

      const result = transactionRepository.create(transaction);

      expect(result).toEqual(transaction);
      expect(transactionRepository.findById("550e8400-e29b-41d4-a716-446655440001")).toEqual(transaction);
    });

    it("should throw ConflictError when creating transaction with existing id", () => {
      const transaction: Transaction = {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "",
        createdAt: "2026-02-16T10:00:00.000Z",
        entries: [],
      };
      transactionRepository.create(transaction);

      const duplicate: Transaction = {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Updated",
        createdAt: "2026-02-16T11:00:00.000Z",
        entries: [],
      };

      expect(() => transactionRepository.create(duplicate)).toThrow(
        "Transaction with id 550e8400-e29b-41d4-a716-446655440002 already exists",
      );
      expect(transactionRepository.findById("550e8400-e29b-41d4-a716-446655440002")).toEqual(transaction);
    });
  });

  describe("findById", () => {
    it("should return transaction when found", () => {
      const transaction: Transaction = {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "",
        createdAt: "2026-02-16T10:00:00.000Z",
        entries: [],
      };
      transactionRepository.create(transaction);

      const result = transactionRepository.findById("550e8400-e29b-41d4-a716-446655440003");

      expect(result).toEqual(transaction);
    });

    it("should return undefined when not found", () => {
      const result = transactionRepository.findById("non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("should return empty array when no transactions", () => {
      const result = transactionRepository.getAll();

      expect(result).toEqual([]);
    });

    it("should return all transactions", () => {
      const transaction1: Transaction = {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "",
        createdAt: "2026-02-16T10:00:00.000Z",
        entries: [],
      };
      const transaction2: Transaction = {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Payment",
        createdAt: "2026-02-16T11:00:00.000Z",
        entries: [],
      };
      transactionRepository.create(transaction1);
      transactionRepository.create(transaction2);

      const result = transactionRepository.getAll();

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(transaction1);
      expect(result).toContainEqual(transaction2);
    });
  });
});
