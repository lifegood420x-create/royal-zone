import { Router, type IRouter } from "express";
import { desc, eq, count, and } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/leaderboard", requireAuth, async (_req, res): Promise<void> => {
  // Alias for referred users
  const referred = db.$with("referred").as(
    db
      .select({
        referrerId: usersTable.referredBy,
        referralCount: count(usersTable.id).as("referral_count"),
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.isFlagged, false),
          eq(usersTable.isBanned, false),
        )
      )
      .groupBy(usersTable.referredBy)
  );

  const rows = await db
    .with(referred)
    .select({
      userId: usersTable.id,
      firstName: usersTable.firstName,
      username: usersTable.username,
      photoUrl: usersTable.photoUrl,
      referralCount: referred.referralCount,
    })
    .from(usersTable)
    .innerJoin(referred, eq(referred.referrerId, usersTable.id))
    .orderBy(desc(referred.referralCount))
    .limit(10);

  const entries = rows.map((row, i) => ({
    rank: i + 1,
    userId: row.userId,
    firstName: row.firstName,
    username: row.username ?? null,
    photoUrl: row.photoUrl ?? null,
    referralCount: Number(row.referralCount),
  }));

  res.json({ entries });
});

export default router;
