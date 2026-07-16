import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name").notNull(),
  photoUrl: text("photo_url"),
  balance: numeric("balance", { precision: 14, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  totalEarned: numeric("total_earned", { precision: 14, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  totalWithdrawn: numeric("total_withdrawn", { precision: 14, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by"),
  isBanned: boolean("is_banned").notNull().default(false),
  isFlagged: boolean("is_flagged").notNull().default(false),
  flagReason: text("flag_reason"),
  vpnStrikeCount: integer("vpn_strike_count").notNull().default(0),
  vpnBlockUntil: timestamp("vpn_block_until", { withTimezone: true }),
  registrationIp: text("registration_ip"),
  registrationDevice: text("registration_device"),
  rejectedWithdrawCount: integer("rejected_withdraw_count").notNull().default(0),
  adWatchDate: date("ad_watch_date", { mode: "string" }),
  adWatchCountToday: integer("ad_watch_count_today").notNull().default(0),
  totalTasksCount: integer("total_tasks_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
