import { createTransactionRequestValidator } from "../../../../src/transactions/validators/create-transaction-request.validator";
import { Direction } from "../../../../src/shared/types/direction";

const validAccountId1 = "550e8400-e29b-41d4-a716-446655440001";
const validAccountId2 = "550e8400-e29b-41d4-a716-446655440002";

describe("CreateTransactionRequestValidator", () => {
  it("should accept valid transaction request", () => {
    const request = {
      name: "Test Transaction",
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
        },
        {
          account_id: validAccountId2,
          direction: Direction.CREDIT,
          amount: 100,
        },
      ],
    };

    const result = createTransactionRequestValidator.validate(request);
    expect(result.name).toBe("Test Transaction");
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].accountId).toBe(validAccountId1);
    expect(result.entries[1].accountId).toBe(validAccountId2);
  });

  it("should reject non-object body", () => {
    expect(() => createTransactionRequestValidator.validate(null)).toThrow("Request body must be an object");
  });

  it("should reject missing entries", () => {
    const request = {
      name: "Test",
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("entries must be a non-empty array");
  });

  it("should reject empty entries array", () => {
    const request = {
      entries: [],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("entries must be a non-empty array");
  });

  it("should reject entry without account_id", () => {
    const request = {
      entries: [
        {
          direction: Direction.DEBIT,
          amount: 100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow(
      "entries[0].account_id is required and must be a string",
    );
  });

  it("should reject entry with invalid UUID for account_id", () => {
    const request = {
      entries: [
        {
          account_id: "not-a-uuid",
          direction: Direction.DEBIT,
          amount: 100,
        },
        {
          account_id: validAccountId2,
          direction: Direction.CREDIT,
          amount: 100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow(
      "entries[0].account_id must be a valid UUID",
    );
  });

  it("should reject entry with invalid direction", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: "invalid",
          amount: 100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow(
      "entries[0].direction is required and must be 'debit' or 'credit'",
    );
  });

  it("should reject entry with zero amount", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 0,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("entries[0].amount must be a positive integer");
  });

  it("should reject entry with negative amount", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: -100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("entries[0].amount must be a positive integer");
  });

  it("should reject entry with non-integer amount", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 10.5,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("entries[0].amount must be a positive integer");
  });

  it("should reject non-string name", () => {
    const request = {
      name: 123,
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("name must be a string");
  });

  it("should reject non-string id", () => {
    const request = {
      id: 123,
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("id must be a string");
  });

  it("should reject invalid UUID format for transaction id", () => {
    const request = {
      id: "not-a-uuid",
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow("id must be a valid UUID");
  });

  it("should accept valid UUID for transaction id", () => {
    const request = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
        },
      ],
    };

    const result = createTransactionRequestValidator.validate(request);
    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.entries[0].accountId).toBe(validAccountId1);
  });

  it("should reject entry with unsupported currency", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
          currency: "XYZ",
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow(
      "entries[0].currency must be a supported currency code",
    );
  });

  it("should accept entry with supported currency", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
          currency: "GBP",
        },
      ],
    };

    const result = createTransactionRequestValidator.validate(request);
    expect(result.entries[0].accountId).toBe(validAccountId1);
    expect(result.entries[0].currency).toBe("GBP");
  });

  it("should accept entry with optional valid UUID id", () => {
    const entryId = "9f694f8c-9c4c-44cf-9ca9-0cb1a318f0a7";
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
          id: entryId,
        },
        {
          account_id: validAccountId2,
          direction: Direction.CREDIT,
          amount: 100,
        },
      ],
    };

    const result = createTransactionRequestValidator.validate(request);
    expect(result.entries[0].id).toBe(entryId);
    expect(result.entries[1].id).toBeUndefined();
  });

  it("should reject entry with invalid UUID for id", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: Direction.DEBIT,
          amount: 100,
          id: "not-a-uuid",
        },
        {
          account_id: validAccountId2,
          direction: Direction.CREDIT,
          amount: 100,
        },
      ],
    };

    expect(() => createTransactionRequestValidator.validate(request)).toThrow(
      "entries[0].id must be a valid UUID",
    );
  });

  it("should accept and normalize uppercase direction and lowercase currency in entries", () => {
    const request = {
      entries: [
        {
          account_id: validAccountId1,
          direction: "CREDIT",
          amount: 100,
          currency: "usd",
        },
        {
          account_id: validAccountId2,
          direction: "DEBIT",
          amount: 100,
          currency: "USD",
        },
      ],
    };

    const result = createTransactionRequestValidator.validate(request);
    expect(result.entries[0].direction).toBe("credit");
    expect(result.entries[0].currency).toBe("USD");
    expect(result.entries[1].direction).toBe("debit");
    expect(result.entries[1].currency).toBe("USD");
  });
});
