import { Router, type IRouter } from "express";
import { GetWebhookStatusResponse, ResetWebhookResponse } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";
import { getPublicDomain } from "../../lib/public-domain";
import { getWebhookInfo, setWebhook } from "../../lib/telegram";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

router.get("/admin/webhook/status", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const info = await getWebhookInfo();
  res.json(
    GetWebhookStatusResponse.parse({
      url: info.url || null,
      pendingUpdateCount: info.pending_update_count,
      lastErrorMessage: info.last_error_message ?? null,
    }),
  );
});

router.post("/admin/webhook/reset", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const domain = getPublicDomain();
  if (!domain) {
    res.status(500).json({ error: "No public domain available to register the webhook." });
    return;
  }

  const webhookUrl = `https://${domain}/api/telegram/webhook`;
  await setWebhook(webhookUrl);
  logger.info({ webhookUrl }, "Telegram webhook reset");

  const info = await getWebhookInfo();
  res.json(
    ResetWebhookResponse.parse({
      url: info.url || null,
      pendingUpdateCount: info.pending_update_count,
      lastErrorMessage: info.last_error_message ?? null,
    }),
  );
});

export default router;
