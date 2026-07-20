import type { User } from "@workspace/db";
import { taskCompletionsTable, db } from "@workspace/db";
import { and, count, eq, gte } from "drizzle-orm";
import { todaysAdCount, todayRangeStart } from "./users";

export async function getTodayTasksCount(userId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(taskCompletionsTable)
    .where(and(eq(taskCompletionsTable.userId, userId), gte(taskCompletionsTable.completedAt, todayRangeStart())));
  return row?.value ?? 0;
}

/** Shapes a DB user row into the public `User` API schema. */
export async function toApiUser(user: User) {
  return {
    id: user.id,
    telegramId: user.telegramId,
    firstName: user.firstName,
    username: user.username,
    photoUrl: user.photoUrl,
    balance: user.balance,
    totalEarned: user.totalEarned,
    totalWithdrawn: user.totalWithdrawn,
    referralCode: user.referralCode,
    referredBy: user.referredBy,
    isBanned: user.isBanned,
    isVerified: user.isVerified,
    isFlagged: user.isFlagged,
    flagReason: user.flagReason,
    vpnStrikeCount: user.vpnStrikeCount,
    vpnBlockedUntil: user.vpnBlockUntil ?? null,
    todayAdsWatched: todaysAdCount(user),
    todayTasksCount: await getTodayTasksCount(user.id),
    totalTasksCount: user.totalTasksCount,
    rejectedWithdrawCount: user.rejectedWithdrawCount,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
  };
}
