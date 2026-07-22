import { usersTable, db, type User } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
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
 * Finds the existing user by Telegram ID, or creates one — crediting the
 * referral bonus on first registration. Always refreshes `lastActiveAt`.
 */
export async function upsertTelegramUser(
  info: TelegramUserInfo,
  opts: { startParam?: string | null; ip?: string | null; deviceId?: string | null } = {},
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
    // A webhook signup from before fraud checks were removed may have left
    // the referral bonus unsettled — settle (credit) it now.
    if (updated.referralPending) {
      return await settlePendingReferral(updated, opts);
    }
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
        referralPending: false,
        registrationIp: opts.ip ?? null,
        registrationDevice: opts.deviceId ?? null,
        isBanned: false,
        isFlagged: false,
        flagReason: null,
      })
      .returning();
    created = inserted;
  } catch (error) {
    const errorCode =
      (error as { code?: string; cause?: { code?: string } }).code ??
      (error as { cause?: { code?: string } }).cause?.code;
    const isUniqueViolation = errorCode === "23505";
    if (!isUniqueViolation) throw error;
    const [existingRow] = await db.select().from(usersTable).where(eq(usersTable.telegramId, info.id));
    if (!existingRow) throw error;
    return existingRow;
  }

  if (referrer) {
    await creditReferrer(referrer.id);
  }

  return created;
}

async function creditReferrer(referrerId: number): Promise<void> {
  const config = await getAppConfig();
  await db
    .update(usersTable)
    .set({
      balance: sql`${usersTable.balance} + ${config.referralBonus}`,
      totalEarned: sql`${usersTable.totalEarned} + ${config.referralBonus}`,
    })
    .where(eq(usersTable.id, referrerId));
}

/**
 * Settles a referral bonus that was parked at webhook-signup time (from
 * before fraud checks were removed) and credits the referrer. The
 * conditional update on referral_pending makes concurrent first requests
 * settle (and pay) at most once.
 */
async function settlePendingReferral(
  user: User,
  opts: { ip?: string | null; deviceId?: string | null },
): Promise<User> {
  const referrer = user.referredBy
    ? (await db.select().from(usersTable).where(eq(usersTable.id, user.referredBy)))[0] ?? null
    : null;

  const [settled] = await db
    .update(usersTable)
    .set({
      referralPending: false,
      registrationIp: user.registrationIp ?? opts.ip ?? null,
      registrationDevice: user.registrationDevice ?? opts.deviceId ?? null,
    })
    .where(and(eq(usersTable.id, user.id), eq(usersTable.referralPending, true)))
    .returning();

  // Another concurrent request already settled it — don't credit twice.
  if (!settled) return user;

  if (referrer) {
    await creditReferrer(referrer.id);
  }

  return settled;
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
