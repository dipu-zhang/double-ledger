import { Direction } from "../../../shared/types/direction";

export interface TransactionResponseEntry {
  id: string;
  account_id: string;
  direction: Direction;
  amount: number;
  currency: string;
}

export interface TransactionResponse {
  id: string;
  name?: string;
  entries: TransactionResponseEntry[];
  created_at: string;
}
