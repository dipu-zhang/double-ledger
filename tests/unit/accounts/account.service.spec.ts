import { accountService } from "../../../src/accounts/account.service";
import { Direction } from "../../../src/shared/types/direction";
import { Currency } from "../../../src/shared/types/currency";
import { accountRepository } from "../../../src/shared/repositories/account-repository";
import { jest } from "@jest/globals";

describe("AccountService", () => {
  beforeEach(() => {
    jest.spyOn(accountRepository, "findById");
    jest.spyOn(accountRepository, "create");
    jest.spyOn(accountRepository, "update");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createAccount", () => {
    it("should create account with provided values", () => {
      jest.spyOn(accountRepository, "findById").mockReturnValue(undefined);
      jest.spyOn(accountRepository, "create").mockImplementation((acc) => acc);

      const account = accountService.createAccount({
        id: "test-id",
        name: "Cash",
        direction: Direction.DEBIT,
        balance: 1000,
      });

      expect(accountRepository.findById).toHaveBeenCalledWith("test-id");
      expect(accountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-id",
          name: "Cash",
          direction: Direction.DEBIT,
          balance: 1000,
          currency: "USD",
        }),
      );
      expect(account).toMatchObject({
        id: "test-id",
        name: "Cash",
        direction: Direction.DEBIT,
        balance: 1000,
        currency: "USD",
      });
    });

    it("should generate id if not provided", () => {
      jest.spyOn(accountRepository, "findById").mockReturnValue(undefined);
      jest.spyOn(accountRepository, "create").mockImplementation((acc) => acc);

      const account = accountService.createAccount({
        direction: Direction.DEBIT,
      });

      expect(accountRepository.findById).toHaveBeenCalled();
      expect(accountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ direction: Direction.DEBIT }),
      );
      expect(account.id).toBeDefined();
      expect(account.id.length).toBeGreaterThan(0);
    });

    it("should default balance to 0", () => {
      jest.spyOn(accountRepository, "findById").mockReturnValue(undefined);
      jest.spyOn(accountRepository, "create").mockImplementation((acc) => acc);

      const account = accountService.createAccount({
        direction: Direction.CREDIT,
      });

      expect(accountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 0 }),
      );
      expect(account.balance).toBe(0);
    });

    it("should default currency to USD", () => {
      jest.spyOn(accountRepository, "findById").mockReturnValue(undefined);
      jest.spyOn(accountRepository, "create").mockImplementation((acc) => acc);

      const account = accountService.createAccount({ direction: Direction.DEBIT });

      expect(accountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: "USD" }),
      );
      expect(account.currency).toBe("USD");
    });

    it("should throw ConflictError when creating account with existing id", () => {
      jest.spyOn(accountRepository, "findById").mockReturnValue({
        id: "duplicate-id",
        name: "",
        direction: Direction.DEBIT,
        balance: 0,
        currency: Currency.USD,
      });

      expect(() =>
        accountService.createAccount({
          id: "duplicate-id",
          direction: Direction.CREDIT,
        }),
      ).toThrow("Account with id duplicate-id already exists");

      expect(accountRepository.findById).toHaveBeenCalledWith("duplicate-id");
      expect(accountRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getAccount", () => {
    it("should return existing account", () => {
      const created = {
        id: "test-id",
        name: "",
        direction: Direction.DEBIT,
        balance: 0,
        currency: Currency.USD,
      };
      jest.spyOn(accountRepository, "findById").mockReturnValue(created);

      const retrieved = accountService.getAccount("test-id");

      expect(accountRepository.findById).toHaveBeenCalledWith("test-id");
      expect(retrieved).toEqual(created);
    });

    it("should throw NotFoundError for non-existent account", () => {
      jest.spyOn(accountRepository, "findById").mockReturnValue(undefined);

      expect(() => accountService.getAccount("non-existent")).toThrow(
        "Account not found: non-existent",
      );

      expect(accountRepository.findById).toHaveBeenCalledWith("non-existent");
    });
  });

  describe("updateAccountBalance", () => {
    it("should update account balance with positive delta", () => {
      const account = {
        id: "test-id",
        name: "",
        direction: Direction.DEBIT,
        balance: 100,
        currency: Currency.USD,
      };
      jest.spyOn(accountRepository, "findById").mockReturnValue(account);
      jest.spyOn(accountRepository, "update").mockImplementation(() => {});

      accountService.updateAccountBalance("test-id", 50);

      expect(accountRepository.findById).toHaveBeenCalledWith("test-id");
      expect(accountRepository.update).toHaveBeenCalledWith("test-id", {
        balance: 150,
      });
    });

    it("should update account balance with negative delta", () => {
      const account = {
        id: "test-id",
        name: "",
        direction: Direction.DEBIT,
        balance: 100,
        currency: Currency.USD,
      };
      jest.spyOn(accountRepository, "findById").mockReturnValue(account);
      jest.spyOn(accountRepository, "update").mockImplementation(() => {});

      accountService.updateAccountBalance("test-id", -30);

      expect(accountRepository.findById).toHaveBeenCalledWith("test-id");
      expect(accountRepository.update).toHaveBeenCalledWith("test-id", {
        balance: 70,
      });
    });

    it("should throw NotFoundError for non-existent account", () => {
      jest.spyOn(accountRepository, "findById").mockReturnValue(undefined);

      expect(() =>
        accountService.updateAccountBalance("non-existent", 50),
      ).toThrow("Account not found: non-existent");

      expect(accountRepository.findById).toHaveBeenCalledWith("non-existent");
      expect(accountRepository.update).not.toHaveBeenCalled();
    });
  });
});
