import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { ListReferralsResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getAppConfig } from "../lib/config";

const router: IRouter = Router();

router.get("/referrals", requireAuth, async (req, res): Promise<void> => {
  const user = req.currentUser!;
  const config = await getAppConfig();

  const referred = await db.select().from(usersTable).where(eq(usersTable.referredBy, user.id));

  const data = ListReferralsResponse.parse({
    referralCode: user.referralCode,
    referralBonus: config.referralBonus,
    totalReferrals: referred.length,
    totalReferralEarnings: referred.filter((r) => !r.isFlagged).length * config.referralBonus,
    referrals: referred.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      username: r.username,
      photoUrl: r.photoUrl,
      joinedAt: r.createdAt,
    })),
  });
  res.json(data);
});

export default router;
