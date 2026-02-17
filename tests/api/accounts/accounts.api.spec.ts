import request from "supertest";
import { createServer } from "../../../src/server";
import { accountRepository } from "../../../src/shared/repositories/account-repository";
import { Direction } from "../../../src/shared/types/direction";

describe("Accounts API", () => {
  const app = createServer();

  afterEach(() => {
    accountRepository.clear();
  });

  describe("POST /accounts", () => {
    it("should create account with valid data", async () => {
      const response = await request(app)
        .post("/accounts")
        .send({
          name: "Cash",
          direction: Direction.DEBIT,
          balance: 1000,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: "Cash",
        direction: Direction.DEBIT,
        balance: 1000,
      });
      expect(response.body.id).toBeDefined();
    });

    it("should create account without optional fields", async () => {
      const response = await request(app)
        .post("/accounts")
        .send({
          direction: Direction.CREDIT,
        })
        .expect(201);

      expect(response.body.direction).toBe(Direction.CREDIT);
      expect(response.body.balance).toBe(0);
    });

    it("should reject account without direction", async () => {
      const response = await request(app)
        .post("/accounts")
        .send({
          name: "Cash",
        })
        .expect(400);

      expect(response.body.error).toContain("direction is required");
    });

    it("should reject account with invalid direction", async () => {
      const response = await request(app)
        .post("/accounts")
        .send({
          direction: "invalid",
        })
        .expect(400);

      expect(response.body.error).toContain("direction must be 'debit' or 'credit'");
    });

    it("should reject account with negative balance", async () => {
      const response = await request(app)
        .post("/accounts")
        .send({
          direction: Direction.DEBIT,
          balance: -100,
        })
        .expect(400);

      expect(response.body.error).toContain("non-negative integer");
    });

    it("should reject account with invalid UUID format", async () => {
      const response = await request(app)
        .post("/accounts")
        .send({
          id: "not-a-valid-uuid",
          direction: Direction.DEBIT,
        })
        .expect(400);

      expect(response.body.error).toContain("id must be a valid UUID");
    });

    it("should create account with valid UUID", async () => {
      const validUUID = "550e8400-e29b-41d4-a716-446655440000";
      const response = await request(app)
        .post("/accounts")
        .send({
          id: validUUID,
          direction: Direction.DEBIT,
          name: "Cash with UUID",
        })
        .expect(201);

      expect(response.body.id).toBe(validUUID);
    });

    it("should reject duplicate account id with 409 Conflict", async () => {
      const validUUID = "650e8400-e29b-41d4-a716-446655440000";

      await request(app)
        .post("/accounts")
        .send({
          id: validUUID,
          direction: Direction.DEBIT,
        })
        .expect(201);

      const response = await request(app)
        .post("/accounts")
        .send({
          id: validUUID,
          direction: Direction.CREDIT,
        })
        .expect(409);

      expect(response.body.error).toContain("already exists");
    });
  });

  describe("GET /accounts/:id", () => {
    it("should return existing account", async () => {
      const createResponse = await request(app)
        .post("/accounts")
        .send({
          direction: Direction.DEBIT,
          name: "Cash",
        })
        .expect(201);

      const accountId = createResponse.body.id;

      const getResponse = await request(app)
        .get(`/accounts/${accountId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        id: accountId,
        name: "Cash",
        direction: Direction.DEBIT,
        balance: 0,
      });
    });

    it("should return 404 for non-existent account", async () => {
      const response = await request(app)
        .get("/accounts/non-existent-id")
        .expect(404);

      expect(response.body.error).toContain("Account not found");
    });
  });

  describe("PDF spec: request/response contract", () => {
    it("POST /accounts — request and response match PDF schema", async () => {
      const id = "71cde2aa-b9bc-496a-a6f1-34964d05e6fd";
      const response = await request(app)
        .post("/accounts")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send({
          name: "test3",
          direction: "debit",
          id,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id,
        name: "test3",
        direction: "debit",
        balance: 0,
      });
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("direction");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
    });

    it("GET /accounts/:id — response matches PDF schema (balance, direction, id, name)", async () => {
      const accountId = "71cde2aa-b9bc-496a-a6f1-34964d05e6fd";
      await request(app)
        .post("/accounts")
        .send({ id: accountId, name: "test3", direction: "debit" })
        .expect(201);

      const response = await request(app)
        .get(`/accounts/${accountId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: accountId,
        name: "test3",
        direction: "debit",
        balance: 0,
      });
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("direction");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
    });
  });
});
