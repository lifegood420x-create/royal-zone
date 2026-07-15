import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, adWatchesTable, usersTable } from "@workspace/db";
import { AdPostbackQueryParams } from "@workspace/api-zod";
import { getAppConfig } from "../lib/config";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * Server-to-server confirmation from the ad network (Monetag/Adsgram),
 * called from the network's own infrastructure — not the Telegram Mini
 * App — so it deliberately does NOT go through requireAuth. Instead it is
 * authenticated by a shared `secret` query param configured as part of
 * the "Postback URL" in the network's dashboard (see admin Settings).
 *
 * Always responds 200 (even on a bad/duplicate claim) so the ad network
 * doesn't treat it as a delivery failure and retry indefinitely; the
 * `credited` field in the body reflects what actually happened, for our
 * own logging/debugging.
 */
async function handlePostback(req: import("express").Request, res: import("express").Response): Promise<void> {
  const parsed = AdPostbackQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(200).json({ credited: false, reason: "invalid_request" });
    return;
  }

  const { secret, claim_id: claimId } = parsed.data;
  const config = await getAppConfig();

  if (!config.postbackSecret || secret !== config.postbackSecret) {
    logger.warn({ claimId }, "Rejected ad postback with invalid secret");
    res.status(200).json({ credited: false, reason: "invalid_secret" });
    return;
  }

  const [claim] = await db.select().from(adWatchesTable).where(eq(adWatchesTable.claimId, claimId));

  if (!claim) {
    res.status(200).json({ credited: false, reason: "unknown_claim" });
    return;
  }

  if (claim.status === "confirmed") {
    // Already credited by an earlier (possibly retried) postback call —
    // idempotent no-op so networks that retry postbacks can't double-pay.
    res.status(200).json({ credited: false, reason: "already_confirmed" });
    return;
  }

  const [confirmedWatch] = await db
    .update(adWatchesTable)
    .set({ status: "confirmed", confirmedAt: new Date() })
    .where(and(eq(adWatchesTable.id, claim.id), eq(adWatchesTable.status, "pending")))
    .returning();

  if (!confirmedWatch) {
    // Lost a race with a concurrent postback retry for the same claim.
    res.status(200).json({ credited: false, reason: "already_confirmed" });
    return;
  }

  await db
    .update(usersTable)
    .set({
      balance: sql`${usersTable.balance} + ${claim.reward}`,
      totalEarned: sql`${usersTable.totalEarned} + ${claim.reward}`,
    })
    .where(eq(usersTable.id, claim.userId));

  logger.info({ claimId, userId: claim.userId, reward: claim.reward }, "Ad postback confirmed");
  res.status(200).json({ credited: true });
}

router.get("/ads/postback", handlePostback);
router.post("/ads/postback", handlePostback);

export default router;
