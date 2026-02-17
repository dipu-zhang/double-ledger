import { Account } from "../entities/account";
import { ConflictError } from "../errors/conflict-error";

class AccountRepository {
  private accounts: Map<string, Account> = new Map();

  create(account: Account): Account {
    if (this.accounts.has(account.id)) {
      throw new ConflictError(`Account with id ${account.id} already exists`);
    }
    this.accounts.set(account.id, account);
    return account;
  }

  findById(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  update(id: string, updates: Partial<Account>): void {
    const account = this.accounts.get(id);
    if (account) {
      this.accounts.set(id, { ...account, ...updates });
    }
  }

  getAll(): Account[] {
    return Array.from(this.accounts.values());
  }

  clear(): void {
    this.accounts.clear();
  }
}

export const accountRepository = new AccountRepository();
