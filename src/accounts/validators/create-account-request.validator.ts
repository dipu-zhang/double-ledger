import { Direction } from "../../shared/types/direction";
import { CreateAccountRequest } from "../dtos/requests/create-account.request";
import { ValidationError } from "../../shared/errors/validation-error";
import { isSupportedCurrency, Currency } from "../../shared/types/currency";
import { isValidUUID } from "../../shared/utils/uuid-validator";

class CreateAccountRequestValidator {
  validate(body: unknown): CreateAccountRequest {
    const errors: string[] = [];

    if (!body || typeof body !== "object") {
      throw new ValidationError("Request body must be an object");
    }

    const req = body as any;

    const normalizedDirection =
      typeof req.direction === "string" ? req.direction.toLowerCase() : req.direction;
    if (!req.direction) {
      errors.push("direction is required");
    } else if (normalizedDirection !== "debit" && normalizedDirection !== "credit") {
      errors.push("direction must be 'debit' or 'credit'");
    }

    if (req.name !== undefined && typeof req.name !== "string") {
      errors.push("name must be a string");
    }

    if (req.balance !== undefined) {
      if (!Number.isInteger(req.balance) || req.balance < 0) {
        errors.push("balance must be a non-negative integer");
      }
    }

    if (req.id !== undefined) {
      if (typeof req.id !== "string") {
        errors.push("id must be a string");
      } else if (!isValidUUID(req.id)) {
        errors.push("id must be a valid UUID");
      }
    }

    const normalizedCurrency =
      typeof req.currency === "string" ? req.currency.toUpperCase() : req.currency;
    if (req.currency !== undefined) {
      if (typeof req.currency !== "string") {
        errors.push("currency must be a string");
      } else if (!isSupportedCurrency(normalizedCurrency)) {
        errors.push("currency must be a supported currency code (USD, EUR, GBP, JPY, KWD)");
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }

    return {
      id: req.id,
      name: req.name,
      direction: normalizedDirection as Direction,
      balance: req.balance,
      currency: req.currency ? (normalizedCurrency as Currency) : undefined,
    };
  }
}

export const createAccountRequestValidator = new CreateAccountRequestValidator();
