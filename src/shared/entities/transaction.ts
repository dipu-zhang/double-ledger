import { Direction } from "../types/direction";
import { Currency } from "../types/currency";

export interface TransactionEntry {
  id: string;
  accountId: string;
  direction: Direction;
  amount: number;
  currency: Currency;
}

export interface Transaction {
  id: string;
  name: string;
  entries: TransactionEntry[];
  createdAt: string;
}
