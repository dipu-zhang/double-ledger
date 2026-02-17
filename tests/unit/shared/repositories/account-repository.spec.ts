import { accountRepository } from "../../../../src/shared/repositories/account-repository";
import { Account } from "../../../../src/shared/entities/account";
import { Direction } from "../../../../src/shared/types/direction";
import { Currency } from "../../../../src/shared/types/currency";

describe("AccountRepository", () => {
  afterEach(() => {
    accountRepository.clear();
  });

  describe("create", () => {
    it("should create and store account", () => {
      const account: Account = {
        id: "acc-1",
        name: "Cash",
        direction: Direction.DEBIT,
        balance: 10000,
        currency: Currency.USD,
      };

      const result = accountRepository.create(account);

      expect(result).toEqual(account);
      expect(accountRepository.findById("acc-1")).toEqual(account);
    });

    it("should throw ConflictError when creating account with existing id", () => {
      const account: Account = {
        id: "acc-1",
        name: "",
        direction: Direction.DEBIT,
        balance: 5000,
        currency: Currency.USD,
      };
      accountRepository.create(account);

      const duplicate: Account = {
        id: "acc-1",
        name: "",
        direction: Direction.CREDIT,
        balance: 10000,
        currency: Currency.EUR,
      };

      expect(() => accountRepository.create(duplicate)).toThrow(
        "Account with id acc-1 already exists",
      );
      expect(accountRepository.findById("acc-1")).toEqual(account);
    });
  });

  describe("findById", () => {
    it("should return account when found", () => {
      const account: Account = {
        id: "acc-1",
        name: "",
        direction: Direction.DEBIT,
        balance: 5000,
        currency: Currency.USD,
      };
      accountRepository.create(account);

      const result = accountRepository.findById("acc-1");

      expect(result).toEqual(account);
    });

    it("should return undefined when not found", () => {
      const result = accountRepository.findById("non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("update", () => {
    it("should update existing account", () => {
      const account: Account = {
        id: "acc-1",
        name: "",
        direction: Direction.DEBIT,
        balance: 5000,
        currency: Currency.USD,
      };
      accountRepository.create(account);

      accountRepository.update("acc-1", { balance: 10000 });

      const updated = accountRepository.findById("acc-1");
      expect(updated?.balance).toBe(10000);
      expect(updated?.direction).toBe(Direction.DEBIT);
    });

    it("should update multiple fields", () => {
      const account: Account = {
        id: "acc-1",
        name: "Old Name",
        direction: Direction.DEBIT,
        balance: 5000,
        currency: Currency.USD,
      };
      accountRepository.create(account);

      accountRepository.update("acc-1", { name: "New Name", balance: 15000 });

      const updated = accountRepository.findById("acc-1");
      expect(updated?.name).toBe("New Name");
      expect(updated?.balance).toBe(15000);
    });

    it("should do nothing when account not found", () => {
      accountRepository.update("non-existent", { balance: 10000 });

      expect(accountRepository.findById("non-existent")).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("should return empty array when no accounts", () => {
      const result = accountRepository.getAll();

      expect(result).toEqual([]);
    });

    it("should return all accounts", () => {
      const account1: Account = {
        id: "acc-1",
        name: "",
        direction: Direction.DEBIT,
        balance: 5000,
        currency: Currency.USD,
      };
      const account2: Account = {
        id: "acc-2",
        name: "",
        direction: Direction.CREDIT,
        balance: 10000,
        currency: Currency.EUR,
      };
      accountRepository.create(account1);
      accountRepository.create(account2);

      const result = accountRepository.getAll();

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(account1);
      expect(result).toContainEqual(account2);
    });
  });
});
