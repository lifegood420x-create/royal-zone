import { Router, type IRouter } from "express";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { db, usersTable, withdrawalsTable } from "@workspace/db";
import { GetAdminDashboardResponse } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/dashboard", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [[totalUsersRow], [active24hRow], [paidRow], [pendingRow], flaggedUsers] = await Promise.all([
    db.select({ value: count() }).from(usersTable),
    db.select({ value: count() }).from(usersTable).where(gte(usersTable.lastActiveAt, dayAgo)),
    db
      .select({ value: sql<number>`coalesce(sum(${withdrawalsTable.amount}), 0)` })
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.status, "paid")),
    db.select({ value: count() }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "pending")),
    db.select().from(usersTable).where(eq(usersTable.isFlagged, true)),
  ]);

  const data = GetAdminDashboardResponse.parse({
    totalUsers: totalUsersRow?.value ?? 0,
    active24h: active24hRow?.value ?? 0,
    totalPaidOut: Number(paidRow?.value ?? 0),
    pendingRequestsCount: pendingRow?.value ?? 0,
    flaggedUsers: flaggedUsers.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      username: u.username,
      telegramId: u.telegramId,
      ip: u.registrationIp,
      reason: u.flagReason ?? "Flagged",
      balance: u.balance,
    })),
  });
  res.json(data);
});

export default router;
