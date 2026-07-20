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
  // Minimum number of seconds the in-app countdown must run after an ad is
  // triggered before the reward is credited — enforced client-side on top
  // of whatever the ad network's own SDK does, so users can't skip straight
  // to the reward.
  adDurationSeconds: integer("ad_duration_seconds").notNull().default(15),
  botName: text("bot_name").notNull().default("Bangla Task Hub"),
  botUsername: text("bot_username").notNull().default(""),
  channelUsername: text("channel_username"),
  adminUsername: text("admin_username").notNull().default("admin"),
  monetagZoneId: text("monetag_zone_id"),
  adsgramBlockId: text("adsgram_block_id"),
  // Lets the admin turn each ad network on/off from the panel without
  // clearing its zone/block ID (so the ID stays saved for when it's
  // re-enabled).
  monetagEnabled: boolean("monetag_enabled").notNull().default(true),
  adsgramEnabled: boolean("adsgram_enabled").notNull().default(true),
  // Shared secret appended to the postback URL registered in the ad
  // network's dashboard, so incoming postback calls can be authenticated.
  postbackSecret: text("postback_secret"),
  // When true, ad rewards are only credited once the ad network's server
  // confirms the view via /ads/postback — the client-side "watched" call
  // alone no longer credits balance. Off by default so ad watching keeps
  // working before postback is configured in the network's dashboard.
  requireAdPostback: boolean("require_ad_postback").notNull().default(false),
  // --- Paid account verification (first withdrawal gate) ---
  verificationEnabled: boolean("verification_enabled").notNull().default(false),
  // 'manual': user pays to the configured bKash/Nagad number and submits the
  // TrxID for admin review. 'auto': user pays through an external gateway
  // (verificationAutoUrl); the gateway confirms via the postback endpoint.
  verificationMode: text("verification_mode", { enum: ["manual", "auto"] })
    .notNull()
    .default("manual"),
  verificationFee: numeric("verification_fee", { precision: 14, scale: 2, mode: "number" })
    .notNull()
    .default(50),
  verificationBkashNumber: text("verification_bkash_number"),
  verificationNagadNumber: text("verification_nagad_number"),
  // Auto mode: external checkout/payment page the user is sent to.
  verificationAutoUrl: text("verification_auto_url"),
  // Auto mode: shared secret the gateway must present when calling
  // /verification/postback to auto-approve a request.
  verificationAutoSecret: text("verification_auto_secret"),
});

export const insertAppConfigSchema = createInsertSchema(appConfigTable).omit({ id: true });
export type InsertAppConfig = z.infer<typeof insertAppConfigSchema>;
export type AppConfig = typeof appConfigTable.$inferSelect;
