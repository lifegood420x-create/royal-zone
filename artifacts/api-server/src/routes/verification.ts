import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, verificationRequestsTable, verificationPaymentMethodsTable } from "@workspace/db";
import {
  GetVerificationStatusResponse,
  SubmitVerificationBody,
  SubmitVerificationResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getAppConfig } from "../lib/config";
import { approveVerificationRequest } from "../lib/verification";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/verification/status", requireAuth, async (req, res): Promise<void> => {
  const user = req.currentUser!;
  const config = await getAppConfig();

  const [[latest], methods] = await Promise.all([
    db
      .select()
      .from(verificationRequestsTable)
      .where(eq(verificationRequestsTable.userId, user.id))
      .orderBy(desc(verificationRequestsTable.createdAt))
      .limit(1),
    db
      .select()
      .from(verificationPaymentMethodsTable)
      .where(eq(verificationPaymentMethodsTable.isActive, true))
      .orderBy(asc(verificationPaymentMethodsTable.sortOrder), asc(verificationPaymentMethodsTable.id)),
  ]);

  res.json(
    GetVerificationStatusResponse.parse({
      enabled: config.verificationEnabled,
      mode: config.verificationMode,
      fee: config.verificationFee,
      bkashNumber: config.verificationBkashNumber,
      nagadNumber: config.verificationNagadNumber,
      autoUrl: config.verificationAutoUrl,
      isVerified: user.isVerified,
      methods,
      ...(latest ? { request: latest } : {}),
    }),
  );
});

router.post("/verification/request", requireAuth, async (req, res): Promise<void> => {
  const parsed = SubmitVerificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = req.currentUser!;
  const config = await getAppConfig();

  if (!config.verificationEnabled) {
    res.status(400).json({ error: "Verification is not enabled." });
    return;
  }
  if (user.isVerified) {
    res.status(409).json({ error: "Account is already verified." });
    return;
  }

  const [pending] = await db
    .select({ id: verificationRequestsTable.id })
    .from(verificationRequestsTable)
    .where(and(
      eq(verificationRequestsTable.userId, user.id),
      eq(verificationRequestsTable.status, "pending"),
    ));
  if (pending) {
    res.status(409).json({ error: "A verification request is already pending review." });
    return;
  }

  const [created] = await db
    .insert(verificationRequestsTable)
    .values({
      userId: user.id,
      fee: config.verificationFee,
      method: parsed.data.method,
      payerNumber: parsed.data.payerNumber,
      trxId: parsed.data.trxId,
      withdrawAmount: parsed.data.withdrawAmount ?? null,
      withdrawMethod: parsed.data.withdrawMethod ?? null,
      withdrawAccountNumber: parsed.data.withdrawAccountNumber ?? null,
    })
    .returning();

  res.status(201).json(SubmitVerificationResponse.parse(created));
});

// Auto-payment gateway confirmation (no user auth — authenticated by the
// shared secret configured in admin Settings). The gateway must call:
//   POST /api/verification/postback?secret=<secret>&request_id=<id>
router.post("/verification/postback", async (req, res): Promise<void> => {
  const secret = String(req.query.secret ?? "");
  const requestId = Number(req.query.request_id ?? req.query.requestId ?? NaN);

  const config = await getAppConfig();
  if (!config.verificationAutoSecret || secret !== config.verificationAutoSecret) {
    res.status(403).json({ error: "Invalid secret." });
    return;
  }
  if (!Number.isInteger(requestId) || requestId <= 0) {
    res.status(400).json({ error: "Invalid request_id." });
    return;
  }

  const decision = await approveVerificationRequest(requestId);
  if (!decision) {
    res.status(404).json({ error: "Request not found or already decided." });
    return;
  }

  logger.info({ requestId }, "Verification auto-approved via gateway postback");
  res.json({ ok: true, withdrawalPlaced: decision.withdrawalPlaced });
});

export default router;
