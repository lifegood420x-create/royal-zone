import { usersTable, db, type User } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { getAppConfig } from "./config";
import type { TelegramUserInfo } from "./telegram";

function generateReferralCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

async function findUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateReferralCode();
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.referralCode, code));
    if (!existing) return code;
  }
  throw new Error("Failed to generate a unique referral code.");
}

/**
 * Finds the existing user by Telegram ID, or creates one — handling
 * referral crediting and same-IP fake-referral flagging on first
 * registration. Always refreshes `lastActiveAt`.
 */
export async function upsertTelegramUser(
  info: TelegramUserInfo,
  opts: { startParam?: string | null; ip?: string | null } = {},
): Promise<User> {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.telegramId, info.id));

  if (existing) {
    const [updated] = await db
      .update(usersTable)
      .set({
        username: info.username,
        firstName: info.firstName,
        photoUrl: info.photoUrl,
        lastActiveAt: new Date(),
      })
      .where(eq(usersTable.id, existing.id))
      .returning();
    return updated;
  }

  const referralCode = await findUniqueReferralCode();

  let referrer: User | null = null;
  if (opts.startParam) {
    const [found] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.referralCode, opts.startParam.trim().toUpperCase()));
    referrer = found ?? null;
  }

  const isSameIpAsReferrer =
    !!referrer && !!opts.ip && !!referrer.registrationIp && referrer.registrationIp === opts.ip;

  let created: User;
  try {
    const [inserted] = await db
      .insert(usersTable)
      .values({
        telegramId: info.id,
        username: info.username,
        firstName: info.firstName,
        photoUrl: info.photoUrl,
        referralCode,
        referredBy: referrer?.id ?? null,
        registrationIp: opts.ip ?? null,
        isFlagged: isSameIpAsReferrer,
        flagReason: isSameIpAsReferrer ? "Self/fake referral (same IP)" : null,
      })
      .returning();
    created = inserted;
  } catch (error) {
    // Two concurrent first-requests for the same Telegram user can both
    // reach here (e.g. the client firing several authenticated calls at
    // once before the row exists). The loser hits the unique constraint
    // on telegram_id — just fall back to the row the winner created.
    const errorCode =
      (error as { code?: string; cause?: { code?: string } }).code ??
      (error as { cause?: { code?: string } }).cause?.code;
    const isUniqueViolation = errorCode === "23505";
    if (!isUniqueViolation) throw error;
    const [existingRow] = await db.select().from(usersTable).where(eq(usersTable.telegramId, info.id));
    if (!existingRow) throw error;
    return existingRow;
  }

  // Credit the referrer's bonus, unless this signup was flagged as fake.
  if (referrer && !isSameIpAsReferrer) {
    const config = await getAppConfig();
    await db
      .update(usersTable)
      .set({
        balance: sql`${usersTable.balance} + ${config.referralBonus}`,
        totalEarned: sql`${usersTable.totalEarned} + ${config.referralBonus}`,
      })
      .where(eq(usersTable.id, referrer.id));
  }

  return created;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns how many ads the user has watched today, resetting the counter if the day changed. */
export function todaysAdCount(user: User): number {
  return user.adWatchDate === todayDateString() ? user.adWatchCountToday : 0;
}

export async function recordAdWatch(userId: number, currentCount: number): Promise<void> {
  await db
    .update(usersTable)
    .set({ adWatchDate: todayDateString(), adWatchCountToday: currentCount + 1 })
    .where(eq(usersTable.id, userId));
}

export function todayRangeStart(): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}
