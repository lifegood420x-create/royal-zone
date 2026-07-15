import { integer, pgTable, text, numeric, boolean } from "drizzle-orm/pg-core";
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
  // Shared secret appended to the postback URL registered in the ad
  // network's dashboard, so incoming postback calls can be authenticated.
  postbackSecret: text("postback_secret"),
  // When true, ad rewards are only credited once the ad network's server
  // confirms the view via /ads/postback — the client-side "watched" call
  // alone no longer credits balance. Off by default so ad watching keeps
  // working before postback is configured in the network's dashboard.
  requireAdPostback: boolean("require_ad_postback").notNull().default(false),
});

export const insertAppConfigSchema = createInsertSchema(appConfigTable).omit({ id: true });
export type InsertAppConfig = z.infer<typeof insertAppConfigSchema>;
export type AppConfig = typeof appConfigTable.$inferSelect;
