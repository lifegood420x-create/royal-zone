import { usersTable, db, type User } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { getAppConfig } from "./config";
import type { TelegramUserInfo } from "./telegram";
import { checkIpForVpn } from "./vpn-check";

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
 * referral crediting and same-device fake-referral flagging on first
 * registration. Always refreshes `lastActiveAt`.
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

  // Anti-fraud: referral farming — one person creates account A (referrer),
  // then spins up B, C, D... on the SAME DEVICE, each using A's referral code.
  // Detection is device-based (persistent client-generated ID stored in
  // localStorage) rather than IP-based, so family members sharing a Wi-Fi
  // router are never penalised. If no deviceId is provided (old client), fall
  // back gracefully — no flag.
  let hasSiblingWithSameDevice = false;
  if (referrer && opts.deviceId) {
    const [sibling] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(
        eq(usersTable.referredBy, referrer.id),
        eq(usersTable.registrationDevice, opts.deviceId),
      ));
    hasSiblingWithSameDevice = !!sibling;
  }

  const isSameDeviceAsReferrer =
    !!referrer &&
    !!opts.deviceId &&
    !!referrer.registrationDevice &&
    referrer.registrationDevice === opts.deviceId;

  // Neither case auto-bans — fake-referral accounts are: (1) denied the
  // referral bonus and (2) blocked from ad rewards (see isFlagged in ads.ts).
  const isFakeReferralChain = hasSiblingWithSameDevice;
  const isSuspiciousFirstSignup = isSameDeviceAsReferrer && !hasSiblingWithSameDevice;

  // VPN / proxy check on first signup
  const vpnResult = await checkIpForVpn(opts.ip);

  const shouldFlag = isFakeReferralChain || isSuspiciousFirstSignup || vpnResult.isVpn;
  const flagReason = isFakeReferralChain
    ? "Fake referral chain: same device reused under the same referrer. Referral bonus denied and ad rewards blocked."
    : isSuspiciousFirstSignup
      ? "Self/fake referral (same device as referrer). Referral bonus denied and ad rewards blocked."
      : vpnResult.isVpn
        ? vpnResult.reason
        : null;

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
        registrationDevice: opts.deviceId ?? null,
        isBanned: false,
        isFlagged: shouldFlag,
        flagReason,
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

  // Credit the referrer's bonus unless this signup was flagged as fake.
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
