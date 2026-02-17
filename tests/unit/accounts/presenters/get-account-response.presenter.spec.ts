import { getAccountResponsePresenter } from "../../../../src/accounts/presenters/get-account-response.presenter";
import { Account } from "../../../../src/shared/entities/account";
import { Direction } from "../../../../src/shared/types/direction";
import { Currency } from "../../../../src/shared/types/currency";

describe("GetAccountResponsePresenter", () => {
  it("maps account entity to response DTO", () => {
    const account: Account = {
      id: "acc-1",
      name: "Revenue",
      direction: Direction.CREDIT,
      balance: 50000,
      currency: Currency.USD,
    };

    expect(getAccountResponsePresenter.present(account)).toEqual({
      id: "acc-1",
      name: "Revenue",
      direction: Direction.CREDIT,
      balance: 50000,
      currency: Currency.USD,
    });
  });
});
