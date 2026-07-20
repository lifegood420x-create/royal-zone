import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, usersTable, verificationRequestsTable } from "@workspace/db";
import {
  ListAdminVerificationsResponse,
  ApproveVerificationParams,
  ApproveVerificationResponse,
  RejectVerificationParams,
  RejectVerificationResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";
import { approveVerificationRequest } from "../../lib/verification";

const router: IRouter = Router();

router.get("/admin/verifications", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const status = typeof req.query.status === "string" ? req.query.status : null;
  const statusFilter =
    status === "pending" || status === "approved" || status === "rejected"
      ? eq(verificationRequestsTable.status, status)
      : undefined;

  const rows = await db
    .select({
      request: verificationRequestsTable,
      user: {
        id: usersTable.id,
        firstName: usersTable.firstName,
        username: usersTable.username,
        telegramId: usersTable.telegramId,
      },
    })
    .from(verificationRequestsTable)
    .innerJoin(usersTable, eq(verificationRequestsTable.userId, usersTable.id))
    .where(statusFilter)
    .orderBy(desc(verificationRequestsTable.createdAt));

  res.json(
    ListAdminVerificationsResponse.parse(
      rows.map((row) => ({ ...row.request, user: row.user })),
    ),
  );
});

router.post("/admin/verifications/:id/approve", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = ApproveVerificationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const decision = await approveVerificationRequest(params.data.id);
  if (!decision) {
    res.status(404).json({ error: "Request not found or already decided." });
    return;
  }

  res.json(ApproveVerificationResponse.parse(decision));
});

router.post("/admin/verifications/:id/reject", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = RejectVerificationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [request] = await db
    .update(verificationRequestsTable)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(and(
      eq(verificationRequestsTable.id, params.data.id),
      eq(verificationRequestsTable.status, "pending"),
    ))
    .returning();

  if (!request) {
    res.status(404).json({ error: "Request not found or already decided." });
    return;
  }

  res.json(RejectVerificationResponse.parse({ request, withdrawalPlaced: false }));
});

export default router;
