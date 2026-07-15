import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { appConfigTable, db, usersTable } from "@workspace/db";
import {
  GetAdminConfigResponse,
  SendBroadcastBody,
  SendBroadcastResponse,
  UpdateAdminConfigBody,
  UpdateAdminConfigResponse,
  RegeneratePostbackSecretResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";
import { getAppConfig, buildPostbackUrl } from "../../lib/config";
import { broadcastMessage } from "../../lib/telegram";

const router: IRouter = Router();

router.get("/admin/config", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const config = await getAppConfig();
  res.json(GetAdminConfigResponse.parse({ ...config, postbackUrl: buildPostbackUrl(config.postbackSecret!) }));
});

router.patch("/admin/config", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await getAppConfig(); // ensures the row exists
  const [updated] = await db
    .update(appConfigTable)
    .set(parsed.data)
    .where(eq(appConfigTable.id, 1))
    .returning();

  res.json(UpdateAdminConfigResponse.parse({ ...updated, postbackUrl: buildPostbackUrl(updated.postbackSecret!) }));
});

router.post("/admin/config/postback-secret", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  await getAppConfig(); // ensures the row exists
  const newSecret = crypto.randomUUID().replace(/-/g, "");
  const [updated] = await db
    .update(appConfigTable)
    .set({ postbackSecret: newSecret })
    .where(eq(appConfigTable.id, 1))
    .returning();

  res.json(RegeneratePostbackSecretResponse.parse({ postbackUrl: buildPostbackUrl(updated.postbackSecret!) }));
});

router.post("/admin/broadcast", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = SendBroadcastBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const users = await db.select({ telegramId: usersTable.telegramId }).from(usersTable);
  const realTelegramIds = users.map((u) => u.telegramId).filter((id) => !id.startsWith("dev-"));

  const result = await broadcastMessage(realTelegramIds, parsed.data.message);
  res.json(SendBroadcastResponse.parse(result));
});

export default router;
