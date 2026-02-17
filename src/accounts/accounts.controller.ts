import { Router, Request, Response } from "express";
import { createAccountRequestValidator } from "./validators/create-account-request.validator";
import { accountService } from "./account.service";
import { createAccountResponsePresenter } from "./presenters/create-account-response.presenter";
import { getAccountResponsePresenter } from "./presenters/get-account-response.presenter";
import { ValidationError } from "../shared/errors/validation-error";
import { NotFoundError } from "../shared/errors/not-found-error";
import { ConflictError } from "../shared/errors/conflict-error";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const request = createAccountRequestValidator.validate(req.body);
    const account = accountService.createAccount(request);
    const response = createAccountResponsePresenter.present(account);
    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof ConflictError) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const account = accountService.getAccount(req.params.id);
    const response = getAccountResponsePresenter.present(account);
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
