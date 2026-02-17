import { Direction } from "../types/direction";
import { Currency } from "../types/currency";

export interface Account {
  id: string;
  name: string;
  direction: Direction;
  balance: number;
  currency: Currency;
}
