import { Direction } from "../../shared/types/direction";
import { CreateTransactionRequest, CreateTransactionRequestEntry } from "../dtos/requests/create-transaction.request";
import { ValidationError } from "../../shared/errors/validation-error";
import { isSupportedCurrency, Currency } from "../../shared/types/currency";
import { isValidUUID } from "../../shared/utils/uuid-validator";

class CreateTransactionRequestValidator {
  validate(body: unknown): CreateTransactionRequest {
    const errors: string[] = [];

    if (!body || typeof body !== "object") {
      throw new ValidationError("Request body must be an object");
    }

    const req = body as any;

    if (!Array.isArray(req.entries) || req.entries.length === 0) {
      errors.push("entries must be a non-empty array");
      if (errors.length > 0) {
        throw new ValidationError(errors.join(", "));
      }
    }

    req.entries.forEach((entry: any, index: number) => {
      if (!entry.account_id || typeof entry.account_id !== "string") {
        errors.push(
          `entries[${index}].account_id is required and must be a string`,
        );
      } else if (!isValidUUID(entry.account_id)) {
        errors.push(`entries[${index}].account_id must be a valid UUID`);
      }

      if (
        !entry.direction ||
        !Object.values(Direction).includes(entry.direction)
      ) {
        errors.push(
          `entries[${index}].direction is required and must be 'debit' or 'credit'`,
        );
      }

      if (!Number.isInteger(entry.amount) || entry.amount <= 0) {
        errors.push(`entries[${index}].amount must be a positive integer`);
      }

      if (entry.currency !== undefined) {
        if (typeof entry.currency !== "string") {
          errors.push(`entries[${index}].currency must be a string`);
        } else if (!isSupportedCurrency(entry.currency)) {
          errors.push(
            `entries[${index}].currency must be a supported currency code (USD, EUR, GBP, JPY, KWD)`,
          );
        }
      }
    });

    if (req.name !== undefined && typeof req.name !== "string") {
      errors.push("name must be a string");
    }

    if (req.id !== undefined) {
      if (typeof req.id !== "string") {
        errors.push("id must be a string");
      } else if (!isValidUUID(req.id)) {
        errors.push("id must be a valid UUID");
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }

    const entries: CreateTransactionRequestEntry[] = req.entries.map((entry: any) => ({
      accountId: entry.account_id,
      direction: entry.direction,
      amount: entry.amount,
      currency: entry.currency ? (entry.currency.toUpperCase() as Currency) : undefined,
    }));

    return {
      id: req.id,
      name: req.name,
      entries,
    };
  }
}

export const createTransactionRequestValidator = new CreateTransactionRequestValidator();
