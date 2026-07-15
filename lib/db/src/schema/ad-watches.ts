import { integer, pgTable, serial, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const adNetworkValues = ["monetag", "adsgram"] as const;

export const adWatchesTable = pgTable("ad_watches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  network: text("network", { enum: adNetworkValues }).notNull(),
  reward: numeric("reward", { precision: 14, scale: 2, mode: "number" }).notNull(),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdWatchSchema = createInsertSchema(adWatchesTable).omit({
  id: true,
  watchedAt: true,
});
export type InsertAdWatch = z.infer<typeof insertAdWatchSchema>;
export type AdWatch = typeof adWatchesTable.$inferSelect;
