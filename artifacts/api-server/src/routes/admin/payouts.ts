import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, usersTable, withdrawalsTable } from "@workspace/db";
import {
  ApprovePayoutParams,
  ApprovePayoutResponse,
  ListPendingPayoutsResponse,
  RejectPayoutBody,
  RejectPayoutParams,
  RejectPayoutResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();

async function withUser(withdrawal: typeof withdrawalsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, withdrawal.userId));
  return {
    ...withdrawal,
    user: { id: user.id, firstName: user.firstName, username: user.username, telegramId: user.telegramId },
  };
}

router.get("/admin/payouts", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(withdrawalsTable)
    .where(eq(withdrawalsTable.status, "pending"))
    .orderBy(desc(withdrawalsTable.requestedAt));

  const withUsers = await Promise.all(rows.map(withUser));
  res.json(ListPendingPayoutsResponse.parse(withUsers));
});

router.post("/admin/payouts/:id/approve", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = ApprovePayoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [withdrawal] = await db
    .select()
    .from(withdrawalsTable)
    .where(eq(withdrawalsTable.id, params.data.id));
  if (!withdrawal || withdrawal.status !== "pending") {
    res.status(404).json({ error: "Pending withdrawal not found." });
    return;
  }

  const [updated] = await db
    .update(withdrawalsTable)
    .set({ status: "paid", processedAt: new Date() })
    .where(eq(withdrawalsTable.id, params.data.id))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId));
  await db
    .update(usersTable)
    .set({ totalWithdrawn: user.totalWithdrawn + updated.amount })
    .where(eq(usersTable.id, user.id));

  res.json(ApprovePayoutResponse.parse(await withUser(updated)));
});

router.post("/admin/payouts/:id/reject", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = RejectPayoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = RejectPayoutBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [withdrawal] = await db
    .select()
    .from(withdrawalsTable)
    .where(eq(withdrawalsTable.id, params.data.id));
  if (!withdrawal || withdrawal.status !== "pending") {
    res.status(404).json({ error: "Pending withdrawal not found." });
    return;
  }

  const [updated] = await db
    .update(withdrawalsTable)
    .set({ status: "rejected", processedAt: new Date(), note: body.data.note ?? null })
    .where(eq(withdrawalsTable.id, params.data.id))
    .returning();

  // Refund the balance and double the effective minimum withdraw for next time.
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId));
  await db
    .update(usersTable)
    .set({
      balance: user.balance + updated.amount,
      rejectedWithdrawCount: user.rejectedWithdrawCount + 1,
    })
    .where(eq(usersTable.id, user.id));

  res.json(RejectPayoutResponse.parse(await withUser(updated)));
});

export default router;
