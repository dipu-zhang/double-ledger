import { Direction } from "../../../shared/types/direction";
import { Currency } from "../../../shared/types/currency";

export interface CreateAccountRequest {
  id?: string;
  name?: string;
  direction: Direction;
  balance?: number;
  currency?: Currency;
}
