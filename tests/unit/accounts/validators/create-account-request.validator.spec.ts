import { createAccountRequestValidator } from "../../../../src/accounts/validators/create-account-request.validator";
import { Direction } from "../../../../src/shared/types/direction";

describe("CreateAccountRequestValidator", () => {
  it("should accept valid account request", () => {
    const request = {
      direction: Direction.DEBIT,
      name: "Cash",
      balance: 0,
    };

    const result = createAccountRequestValidator.validate(request);
    expect(result).toEqual(request);
  });

  it("should accept valid account request without optional fields", () => {
    const request = {
      direction: Direction.CREDIT,
    };

    const result = createAccountRequestValidator.validate(request);
    expect(result).toEqual(request);
  });

  it("should reject non-object body", () => {
    expect(() => createAccountRequestValidator.validate(null)).toThrow("Request body must be an object");
  });

  it("should reject missing direction", () => {
    const request = {
      name: "Cash",
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow(
      "direction is required",
    );
  });

  it("should reject invalid direction", () => {
    const request = {
      direction: "invalid",
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow(
      "direction must be 'debit' or 'credit'",
    );
  });

  it("should reject non-string name", () => {
    const request = {
      direction: Direction.DEBIT,
      name: 123,
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow("name must be a string");
  });

  it("should reject negative balance", () => {
    const request = {
      direction: Direction.DEBIT,
      balance: -100,
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow("balance must be a non-negative integer");
  });

  it("should reject non-integer balance", () => {
    const request = {
      direction: Direction.DEBIT,
      balance: 10.5,
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow("balance must be a non-negative integer");
  });

  it("should reject non-string id", () => {
    const request = {
      direction: Direction.DEBIT,
      id: 123,
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow("id must be a string");
  });

  it("should reject invalid UUID format", () => {
    const request = {
      direction: Direction.DEBIT,
      id: "not-a-uuid",
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow("id must be a valid UUID");
  });

  it("should accept valid UUID", () => {
    const request = {
      direction: Direction.DEBIT,
      id: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = createAccountRequestValidator.validate(request);
    expect(result).toEqual(request);
  });

  it("should reject unsupported currency", () => {
    const request = {
      direction: Direction.DEBIT,
      currency: "XYZ",
    };

    expect(() => createAccountRequestValidator.validate(request)).toThrow(
      "currency must be a supported currency code",
    );
  });

  it("should accept supported currency", () => {
    const request = {
      direction: Direction.DEBIT,
      currency: "EUR",
    };

    const result = createAccountRequestValidator.validate(request);
    expect(result).toEqual(request);
  });
});
