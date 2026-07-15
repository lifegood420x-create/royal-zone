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

  // Anti-fraud: referral farming looks like one person creating account A
  // (the referrer), then spinning up B, C, D... from the same device/IP,
  // each entered A's referral code to farm bonuses. We let the *first*
  // account from a given IP under a referrer through (so genuine friends
  // sharing a home wifi/router aren't punished), and auto-ban every
  // subsequent signup that reuses an IP already seen under that same
  // referrer. This is a check-then-insert (not DB-constrained), so two
  // truly simultaneous first-signups from the same IP could both slip
  // through unbanned — acceptable given fraud farming is normally
  // sequential, not parallel.
  let hasSiblingWithSameIp = false;
  if (referrer && opts.ip) {
    const [sibling] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.referredBy, referrer.id), eq(usersTable.registrationIp, opts.ip)));
    hasSiblingWithSameIp = !!sibling;
  }

  const isSameIpAsReferrer =
    !!referrer && !!opts.ip && !!referrer.registrationIp && referrer.registrationIp === opts.ip;

  // Neither case is auto-banned (the account can still use the app) — per
  // product decision, fake-referral accounts are instead: (1) denied the
  // referral bonus below, and (2) blocked from earning ad rewards (see the
  // isFlagged check in routes/ads.ts). This avoids collateral damage from
  // outright bans while still removing the financial incentive to farm.
  const isFakeReferralChain = hasSiblingWithSameIp;
  const isSuspiciousFirstSignup = isSameIpAsReferrer && !hasSiblingWithSameIp;

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
        isBanned: false,
        isFlagged: isFakeReferralChain || isSuspiciousFirstSignup,
        flagReason: isFakeReferralChain
          ? "Fake referral chain: duplicate IP reused under the same referrer. Referral bonus denied and ad rewards blocked."
          : isSuspiciousFirstSignup
            ? "Self/fake referral (same IP as referrer). Referral bonus denied and ad rewards blocked."
            : null,
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

  // Credit the referrer's bonus, unless this signup was flagged/banned as fake.
  if (referrer && !isFakeReferralChain && !isSuspiciousFirstSignup) {
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
