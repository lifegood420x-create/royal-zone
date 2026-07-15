import { Router, type IRouter } from "express";
import { AuthenticateResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { toApiUser } from "../lib/serialize";

const router: IRouter = Router();

// The referral start param (if any) is already extracted from Telegram
// initData and consumed by requireAuth on first registration.
router.post("/auth/session", requireAuth, async (req, res): Promise<void> => {
  const user = req.currentUser!;
  const data = AuthenticateResponse.parse({
    user: await toApiUser(user),
    isAdmin: !!req.isAdmin,
  });
  res.json(data);
});

export default router;
