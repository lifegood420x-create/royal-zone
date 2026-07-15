import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, usersTable, withdrawalsTable } from "@workspace/db";
import { ListWithdrawalsResponse, RequestWithdrawalBody, RequestWithdrawalResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getAppConfig, effectiveMinWithdraw } from "../lib/config";

const router: IRouter = Router();

router.get("/withdrawals", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(withdrawalsTable)
    .where(eq(withdrawalsTable.userId, req.currentUser!.id))
    .orderBy(desc(withdrawalsTable.requestedAt));
  res.json(ListWithdrawalsResponse.parse(rows));
});

router.post("/withdrawals", requireAuth, async (req, res): Promise<void> => {
  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = req.currentUser!;
  const config = await getAppConfig();
  const minWithdraw = effectiveMinWithdraw(config.minWithdraw, user.rejectedWithdrawCount);

  if (parsed.data.amount < minWithdraw) {
    res.status(400).json({ error: `Minimum withdrawal is ${minWithdraw}.` });
    return;
  }

  if (parsed.data.amount > user.balance) {
    res.status(400).json({ error: "Insufficient balance." });
    return;
  }

  const [withdrawal] = await db
    .insert(withdrawalsTable)
    .values({
      userId: user.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      accountNumber: parsed.data.accountNumber,
    })
    .returning();

  await db
    .update(usersTable)
    .set({ balance: user.balance - parsed.data.amount })
    .where(eq(usersTable.id, user.id));

  res.status(201).json(RequestWithdrawalResponse.parse(withdrawal));
});

export default router;
