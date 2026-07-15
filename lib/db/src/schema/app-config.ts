import { integer, pgTable, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Single-row configuration table. Always read/write the row with id = 1.
export const appConfigTable = pgTable("app_config", {
  id: integer("id").primaryKey().default(1),
  minWithdraw: numeric("min_withdraw", { precision: 14, scale: 2, mode: "number" })
    .notNull()
    .default(1020),
  referralBonus: numeric("referral_bonus", { precision: 14, scale: 2, mode: "number" })
    .notNull()
    .default(50),
  adReward: numeric("ad_reward", { precision: 14, scale: 2, mode: "number" })
    .notNull()
    .default(5),
  adDailyLimit: integer("ad_daily_limit").notNull().default(20),
  botName: text("bot_name").notNull().default("AS Earning"),
  botUsername: text("bot_username").notNull().default(""),
  channelUsername: text("channel_username"),
  adminUsername: text("admin_username").notNull().default("admin"),
  monetagZoneId: text("monetag_zone_id"),
  adsgramBlockId: text("adsgram_block_id"),
});

export const insertAppConfigSchema = createInsertSchema(appConfigTable).omit({ id: true });
export type InsertAppConfig = z.infer<typeof insertAppConfigSchema>;
export type AppConfig = typeof appConfigTable.$inferSelect;
