import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, adNetworksTable } from "@workspace/db";
import { ListPublicAdNetworksResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/ad-networks", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(adNetworksTable)
    .where(eq(adNetworksTable.isEnabled, true))
    .orderBy(asc(adNetworksTable.sortOrder), asc(adNetworksTable.id));
  res.json(ListPublicAdNetworksResponse.parse(rows));
});

export default router;
