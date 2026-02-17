import request from "supertest";
import { createServer } from "../../../src/server";
import { accountRepository } from "../../../src/shared/repositories/account-repository";
import { transactionRepository } from "../../../src/shared/repositories/transaction-repository";
import { Direction } from "../../../src/shared/types/direction";

describe("Transactions API", () => {
  const app = createServer();
  let cashAccountId: string;
  let revenueAccountId: string;

  beforeEach(async () => {
    const cashResponse = await request(app)
      .post("/accounts")
      .send({
        name: "Cash",
        direction: Direction.DEBIT,
        balance: 0,
      });
    cashAccountId = cashResponse.body.id;

    const revenueResponse = await request(app)
      .post("/accounts")
      .send({
        name: "Revenue",
        direction: Direction.CREDIT,
        balance: 0,
      });
    revenueAccountId = revenueResponse.body.id;
  });

  afterEach(() => {
    accountRepository.clear();
    transactionRepository.clear();
  });

  describe("POST /transactions", () => {
    it("should create balanced transaction", async () => {
      const response = await request(app)
        .post("/transactions")
        .send({
          name: "Sale",
          entries: [
            {
              account_id: cashAccountId,
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 100,
            },
          ],
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: "Sale",
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
      expect(response.body.entries).toHaveLength(2);
    });

    it("should update account balances", async () => {
      await request(app)
        .post("/transactions")
        .send({
          entries: [
            {
              account_id: cashAccountId,
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 100,
            },
          ],
        })
        .expect(201);

      const cashResponse = await request(app).get(`/accounts/${cashAccountId}`);
      const revenueResponse = await request(app).get(
        `/accounts/${revenueAccountId}`,
      );

      expect(cashResponse.body.balance).toBe(100);
      expect(revenueResponse.body.balance).toBe(100);
    });

    it("should reject unbalanced transaction", async () => {
      const response = await request(app)
        .post("/transactions")
        .send({
          entries: [
            {
              account_id: cashAccountId,
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 50,
            },
          ],
        })
        .expect(400);

      expect(response.body.error).toContain("must be balanced");
    });

    it("should reject transaction with non-existent account", async () => {
      const nonExistentAccountId = "550e8400-e29b-41d4-a716-446655440099";
      const response = await request(app)
        .post("/transactions")
        .send({
          entries: [
            {
              account_id: nonExistentAccountId,
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 100,
            },
          ],
        })
        .expect(404);

      expect(response.body.error).toContain("Account not found");
    });

    it("should reject transaction with empty entries", async () => {
      const response = await request(app)
        .post("/transactions")
        .send({
          entries: [],
        })
        .expect(400);

      expect(response.body.error).toContain("non-empty array");
    });

    it("should reject transaction with invalid UUID format", async () => {
      const response = await request(app)
        .post("/transactions")
        .send({
          id: "not-a-valid-uuid",
          entries: [
            {
              account_id: cashAccountId,
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 100,
            },
          ],
        })
        .expect(400);

      expect(response.body.error).toContain("id must be a valid UUID");
    });

    it("should create transaction with valid UUID", async () => {
      const validUUID = "750e8400-e29b-41d4-a716-446655440000";
      const response = await request(app)
        .post("/transactions")
        .send({
          id: validUUID,
          name: "Transaction with UUID",
          entries: [
            {
              account_id: cashAccountId,
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 100,
            },
          ],
        })
        .expect(201);

      expect(response.body.id).toBe(validUUID);
    });

    it("should handle idempotent requests with same id and payload", async () => {
      const transactionRequest = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Sale",
        entries: [
          {
            account_id: cashAccountId,
            direction: Direction.DEBIT,
            amount: 100,
          },
          {
            account_id: revenueAccountId,
            direction: Direction.CREDIT,
            amount: 100,
          },
        ],
      };

      const response1 = await request(app)
        .post("/transactions")
        .send(transactionRequest)
        .expect(201);

      const response2 = await request(app)
        .post("/transactions")
        .send(transactionRequest)
        .expect(201);

      expect(response1.body.id).toBe(response2.body.id);
      expect(response1.body.created_at).toBe(response2.body.created_at);

      const cashResponse = await request(app).get(`/accounts/${cashAccountId}`);
      expect(cashResponse.body.balance).toBe(100);
    });

    it("should reject idempotent request with same id but different payload", async () => {
      await request(app)
        .post("/transactions")
        .send({
          id: "650e8400-e29b-41d4-a716-446655440000",
          entries: [
            {
              account_id: cashAccountId,
              direction: Direction.DEBIT,
              amount: 100,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 100,
            },
          ],
        })
        .expect(201);

      const response = await request(app)
        .post("/transactions")
        .send({
          id: "650e8400-e29b-41d4-a716-446655440000",
          entries: [
            {
              account_id: cashAccountId,
              direction: Direction.DEBIT,
              amount: 200,
            },
            {
              account_id: revenueAccountId,
              direction: Direction.CREDIT,
              amount: 200,
            },
          ],
        })
        .expect(409);

      expect(response.body.error).toContain("already exists with different data");
    });

    it("should reject 409 when reusing an entry id from another transaction", async () => {
      const entryId = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
      await request(app)
        .post("/transactions")
        .send({
          name: "First",
          entries: [
            { account_id: cashAccountId, direction: Direction.DEBIT, amount: 50, id: entryId },
            { account_id: revenueAccountId, direction: Direction.CREDIT, amount: 50 },
          ],
        })
        .expect(201);

      const response = await request(app)
        .post("/transactions")
        .send({
          name: "Second",
          entries: [
            { account_id: cashAccountId, direction: Direction.DEBIT, amount: 30, id: entryId },
            { account_id: revenueAccountId, direction: Direction.CREDIT, amount: 30 },
          ],
        })
        .expect(409);

      expect(response.body.error).toContain("Entry with id");
      expect(response.body.error).toContain("already exists");
    });
  });

  describe("PDF spec: request/response contract", () => {
    it("POST /transactions — PDF example request and response", async () => {
      const debitAccountId = "fa967ec9-5be2-4c26-a874-7eeeabfc6da8";
      const creditAccountId = "dbf17d00-8701-4c4e-9fc5-6ae33c324309";
      const transactionId = "3256dc3c-7b18-4a21-95c6-146747cf2971";

      await request(app)
        .post("/accounts")
        .send({ id: debitAccountId, direction: "debit" })
        .expect(201);
      await request(app)
        .post("/accounts")
        .send({ id: creditAccountId, direction: "credit" })
        .expect(201);

      const response = await request(app)
        .post("/transactions")
        .set("Content-Type", "application/json")
        .send({
          name: "test",
          id: transactionId,
          entries: [
            {
              direction: "debit",
              account_id: debitAccountId,
              amount: 100,
            },
            {
              direction: "credit",
              account_id: creditAccountId,
              amount: 100,
            },
          ],
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: transactionId,
        name: "test",
        entries: [
          {
            id: expect.any(String),
            account_id: debitAccountId,
            direction: "debit",
            amount: 100,
          },
          {
            id: expect.any(String),
            account_id: creditAccountId,
            direction: "credit",
            amount: 100,
          },
        ],
      });

      const debitRes = await request(app).get(`/accounts/${debitAccountId}`);
      const creditRes = await request(app).get(
        `/accounts/${creditAccountId}`,
      );
      expect(debitRes.body.balance).toBe(100);
      expect(creditRes.body.balance).toBe(100);
    });
  });
});
