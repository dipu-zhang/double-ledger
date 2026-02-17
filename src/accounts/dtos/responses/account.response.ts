import { Direction } from "../../../shared/types/direction";

export interface AccountResponse {
  id: string;
  name?: string;
  direction: Direction;
  balance: number;
  currency: string;
}
