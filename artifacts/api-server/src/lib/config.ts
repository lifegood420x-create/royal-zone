import { appConfigTable, db, type AppConfig } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * The app configuration is a single row (id = 1). Ensures it exists and
 * returns it, creating sane defaults on first access.
 */
export async function getAppConfig(): Promise<AppConfig> {
  const [existing] = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
  if (existing) return existing;

  const [created] = await db
    .insert(appConfigTable)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Someone else created it concurrently — read it back.
  const [row] = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
  return row;
}

/** Effective minimum withdrawal for a user: doubles per past rejection. */
export function effectiveMinWithdraw(baseMinWithdraw: number, rejectedWithdrawCount: number): number {
  return baseMinWithdraw * Math.pow(2, rejectedWithdrawCount);
}
