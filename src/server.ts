import express from "express";
import accountRouter from "./accounts/accounts.controller";
import transactionRouter from "./transactions/transactions.controller";

export function createServer() {
  const app = express();

  app.use(express.json());

  app.use("/accounts", accountRouter);
  app.use("/transactions", transactionRouter);

  return app;
}
