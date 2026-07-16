import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, adWatchesTable } from "@workspace/db";
import { WatchAdBody, WatchAdResponse, ClaimAdBody, ClaimAdResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { toApiUser } from "../lib/serialize";
import { getAppConfig } from "../lib/config";
import { todaysAdCount, recordAdWatch } from "../lib/users";
import { checkIpForVpn } from "../lib/vpn-check";

const router: IRouter = Router();

router.post("/ads/watch", requireAuth, async (req, res): Promise<void> => {
  const parsed = WatchAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = req.currentUser!;

  if (user.isFlagged) {
    res.status(403).json({ error: "Ad rewards are disabled for this account." });
    return;
  }

  // Real-time VPN check — flag and block even if they passed signup clean
  const requestIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
  const vpnResult = await checkIpForVpn(requestIp);
  if (vpnResult.isVpn) {
    await db.update(usersTable)
      .set({ isFlagged: true, flagReason: vpnResult.reason })
      .where(eq(usersTable.id, user.id));
    res.status(403).json({ error: "Ad rewards are disabled for this account." });
    return;
  }

  const config = await getAppConfig();

  if (config.requireAdPostback) {
    res.status(409).json({
      error: "Postback verification is enabled — call /ads/claim before showing the ad instead.",
    });
    return;
  }

  const currentCount = todaysAdCount(user);

  if (currentCount >= config.adDailyLimit) {
    res.status(429).json({ error: "Daily ad watch limit reached." });
    return;
  }

  await recordAdWatch(user.id, currentCount);

  const [adWatch] = await db
    .insert(adWatchesTable)
    .values({ userId: user.id, network: parsed.data.network, reward: config.adReward })
    .returning();

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      balance: user.balance + config.adReward,
      totalEarned: user.totalEarned + config.adReward,
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  const data = WatchAdResponse.parse({
    user: await toApiUser(updatedUser),
    adWatch,
  });
  res.json(data);
});

/**
 * Reserves today's ad-watch slot up front (so the daily limit can't be
 * bypassed by spamming claims) and returns an opaque claimId. The client
 * passes this claimId to the ad network's show call as a request var; the
 * ad network's server later echoes it back on /ads/postback once it has
 * independently verified the view, and that's what actually credits the
 * reward — the client alone can no longer trigger a credit.
 */
router.post("/ads/claim", requireAuth, async (req, res): Promise<void> => {
  const parsed = ClaimAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = req.currentUser!;

  if (user.isFlagged) {
    res.status(403).json({ error: "Ad rewards are disabled for this account." });
    return;
  }

  // Real-time VPN check
  const claimIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
  const claimVpn = await checkIpForVpn(claimIp);
  if (claimVpn.isVpn) {
    await db.update(usersTable)
      .set({ isFlagged: true, flagReason: claimVpn.reason })
      .where(eq(usersTable.id, user.id));
    res.status(403).json({ error: "Ad rewards are disabled for this account." });
    return;
  }

  const config = await getAppConfig();
  const currentCount = todaysAdCount(user);

  if (currentCount >= config.adDailyLimit) {
    res.status(429).json({ error: "Daily ad watch limit reached." });
    return;
  }

  await recordAdWatch(user.id, currentCount);

  const claimId = crypto.randomUUID();
  await db.insert(adWatchesTable).values({
    userId: user.id,
    network: parsed.data.network,
    reward: config.adReward,
    source: "postback",
    status: "pending",
    claimId,
  });

  res.json(ClaimAdResponse.parse({ claimId }));
});

export default router;
