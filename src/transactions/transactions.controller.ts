import { Router, Request, Response } from "express";
import { createTransactionRequestValidator } from "./validators/create-transaction-request.validator";
import { transactionService } from "./transaction.service";
import { createTransactionResponsePresenter } from "./presenters/create-transaction-response.presenter";
import { ValidationError } from "../shared/errors/validation-error";
import { NotFoundError } from "../shared/errors/not-found-error";
import { ConflictError } from "../shared/errors/conflict-error";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const request = createTransactionRequestValidator.validate(req.body);
    const transaction = transactionService.createTransaction(request);
    const response = createTransactionResponsePresenter.present(transaction);
    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof ConflictError) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
