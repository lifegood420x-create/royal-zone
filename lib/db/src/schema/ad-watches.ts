import { integer, pgTable, serial, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const adWatchSourceValues = ["client", "postback"] as const;
export const adWatchStatusValues = ["pending", "confirmed"] as const;

export const adWatchesTable = pgTable("ad_watches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  // Free-form network key — "monetag", "adsgram", or a custom admin-defined network name.
  network: text("network").notNull(),
  reward: numeric("reward", { precision: 14, scale: 2, mode: "number" }).notNull(),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
  // "client" = credited immediately when the browser reported completion
  // (default, works without any ad-network dashboard setup). "postback" =
  // reserved on claim and only credited once the ad network's server
  // confirms the view via /ads/postback.
  source: text("source", { enum: adWatchSourceValues }).notNull().default("client"),
  status: text("status", { enum: adWatchStatusValues }).notNull().default("confirmed"),
  // Opaque id handed to the client on /ads/claim and echoed back by the ad
  // network in its postback call, so we can match the confirmation to the
  // right reservation. Unique so a postback can never confirm twice.
  claimId: text("claim_id").unique(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

export const insertAdWatchSchema = createInsertSchema(adWatchesTable).omit({
  id: true,
  watchedAt: true,
});
export type InsertAdWatch = z.infer<typeof insertAdWatchSchema>;
export type AdWatch = typeof adWatchesTable.$inferSelect;
