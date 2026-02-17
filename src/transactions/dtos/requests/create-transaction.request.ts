import { Direction } from "../../../shared/types/direction";
import { Currency } from "../../../shared/types/currency";

export interface CreateTransactionRequestEntry {
  id?: string;
  accountId: string;
  direction: Direction;
  amount: number;
  currency?: Currency;
}

export interface CreateTransactionRequest {
  id?: string;
  name?: string;
  entries: CreateTransactionRequestEntry[];
}
