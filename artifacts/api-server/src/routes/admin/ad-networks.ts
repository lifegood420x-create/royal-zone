import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, adNetworksTable } from "@workspace/db";
import {
  ListAdminAdNetworksResponse,
  CreateAdNetworkBody,
  CreateAdNetworkResponse,
  UpdateAdNetworkParams,
  UpdateAdNetworkBody,
  UpdateAdNetworkResponse,
  DeleteAdNetworkParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/ad-networks", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(adNetworksTable)
    .orderBy(asc(adNetworksTable.sortOrder), asc(adNetworksTable.id));
  res.json(ListAdminAdNetworksResponse.parse(rows));
});

router.post("/admin/ad-networks", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdNetworkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(adNetworksTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateAdNetworkResponse.parse(created));
});

router.put("/admin/ad-networks/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdNetworkParams.safeParse(req.params);
  const parsed = UpdateAdNetworkBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: (params.success ? parsed : params).error?.message ?? "Invalid request." });
    return;
  }
  const [updated] = await db
    .update(adNetworksTable)
    .set(parsed.data)
    .where(eq(adNetworksTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Ad network not found." });
    return;
  }
  res.json(UpdateAdNetworkResponse.parse(updated));
});

router.delete("/admin/ad-networks/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdNetworkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(adNetworksTable)
    .where(eq(adNetworksTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Ad network not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;
