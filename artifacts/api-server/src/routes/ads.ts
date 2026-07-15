import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, adWatchesTable } from "@workspace/db";
import { WatchAdBody, WatchAdResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { toApiUser } from "../lib/serialize";
import { getAppConfig } from "../lib/config";
import { todaysAdCount, recordAdWatch } from "../lib/users";

const router: IRouter = Router();

router.post("/ads/watch", requireAuth, async (req, res): Promise<void> => {
  const parsed = WatchAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = req.currentUser!;
  const config = await getAppConfig();
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

export default router;
