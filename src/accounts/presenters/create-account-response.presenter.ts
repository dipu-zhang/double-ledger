import { Account } from "../../shared/entities/account";
import { AccountResponse } from "../dtos/responses/account.response";

class CreateAccountResponsePresenter {
  present(account: Account): AccountResponse {
    return {
      id: account.id,
      name: account.name,
      direction: account.direction,
      balance: account.balance,
      currency: account.currency,
    };
  }
}

export const createAccountResponsePresenter = new CreateAccountResponsePresenter();
