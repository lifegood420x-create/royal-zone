import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, verificationPaymentMethodsTable } from "@workspace/db";
import {
  ListVerificationMethodsResponse,
  CreateVerificationMethodBody,
  CreateVerificationMethodResponse,
  UpdateVerificationMethodParams,
  UpdateVerificationMethodBody,
  UpdateVerificationMethodResponse,
  DeleteVerificationMethodParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/verification-methods", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(verificationPaymentMethodsTable)
    .orderBy(asc(verificationPaymentMethodsTable.sortOrder), asc(verificationPaymentMethodsTable.id));
  res.json(ListVerificationMethodsResponse.parse(rows));
});

router.post("/admin/verification-methods", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateVerificationMethodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(verificationPaymentMethodsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateVerificationMethodResponse.parse(created));
});

router.patch("/admin/verification-methods/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateVerificationMethodParams.safeParse(req.params);
  const parsed = UpdateVerificationMethodBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: (params.success ? parsed : params).error?.message ?? "Invalid request." });
    return;
  }
  const [updated] = await db
    .update(verificationPaymentMethodsTable)
    .set(parsed.data)
    .where(eq(verificationPaymentMethodsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Method not found." });
    return;
  }
  res.json(UpdateVerificationMethodResponse.parse(updated));
});

router.delete("/admin/verification-methods/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteVerificationMethodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(verificationPaymentMethodsTable)
    .where(eq(verificationPaymentMethodsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Method not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;
