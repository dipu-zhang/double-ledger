import { createAccountResponsePresenter } from "../../../../src/accounts/presenters/create-account-response.presenter";
import { Account } from "../../../../src/shared/entities/account";
import { Direction } from "../../../../src/shared/types/direction";
import { Currency } from "../../../../src/shared/types/currency";

describe("CreateAccountResponsePresenter", () => {
  it("maps account entity to response DTO", () => {
    const account: Account = {
      id: "acc-1",
      name: "Cash",
      direction: Direction.DEBIT,
      balance: 10000,
      currency: Currency.USD,
    };

    expect(createAccountResponsePresenter.present(account)).toEqual({
      id: "acc-1",
      name: "Cash",
      direction: Direction.DEBIT,
      balance: 10000,
      currency: Currency.USD,
    });
  });
});
