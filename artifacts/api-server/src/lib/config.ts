import { appConfigTable, db, type AppConfig } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * The app configuration is a single row (id = 1). Ensures it exists and
 * returns it, creating sane defaults on first access.
 */
export async function getAppConfig(): Promise<AppConfig> {
  const [existing] = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
  if (existing) return existing.postbackSecret ? existing : await ensurePostbackSecret(existing);

  const [created] = await db
    .insert(appConfigTable)
    .values({ id: 1, postbackSecret: crypto.randomUUID().replace(/-/g, "") })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Someone else created it concurrently — read it back.
  const [row] = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
  return row.postbackSecret ? row : await ensurePostbackSecret(row);
}

/** Backfills a postback secret for rows created before this field existed. */
async function ensurePostbackSecret(config: AppConfig): Promise<AppConfig> {
  const [updated] = await db
    .update(appConfigTable)
    .set({ postbackSecret: crypto.randomUUID().replace(/-/g, "") })
    .where(eq(appConfigTable.id, 1))
    .returning();
  return updated;
}

/** Effective minimum withdrawal for a user: doubles per past rejection. */
export function effectiveMinWithdraw(baseMinWithdraw: number, rejectedWithdrawCount: number): number {
  return baseMinWithdraw * Math.pow(2, rejectedWithdrawCount);
}

/**
 * Public postback URL for Monetag — uses {click_id} macro.
 */
export function buildPostbackUrl(secret: string): string {
  const domains = (process.env.REPLIT_DOMAINS ?? "").split(",").filter(Boolean);
  const domain = domains[0];
  const base = domain ? `https://${domain}` : "";
  return `${base}/api/ads/postback?secret=${secret}&claim_id={click_id}`;
}

/**
 * Public postback URL for AdsGram — uses {subid} macro (AdsGram echoes
 * the value passed to controller.show({ subid }) back via this macro).
 */
export function buildAdsgramPostbackUrl(secret: string): string {
  const domains = (process.env.REPLIT_DOMAINS ?? "").split(",").filter(Boolean);
  const domain = domains[0];
  const base = domain ? `https://${domain}` : "";
  return `${base}/api/ads/postback?secret=${secret}&claim_id={subid}`;
}
