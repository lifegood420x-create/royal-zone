import { integer, pgTable, serial, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { withdrawalMethodValues } from "./withdrawals";

export const verificationStatusValues = ["pending", "approved", "rejected"] as const;

/**
 * One-time paid account verification requests, demanded on a user's first
 * withdrawal attempt while verification is enabled in app_config. The
 * withdraw* columns carry the withdrawal the user was trying to place, so
 * an admin approval can place it automatically.
 */
export const verificationRequestsTable = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  fee: numeric("fee", { precision: 14, scale: 2, mode: "number" }).notNull(),
  method: text("method", { enum: withdrawalMethodValues }).notNull(),
  // The number the user says they paid from, and the payment's transaction id.
  payerNumber: text("payer_number").notNull(),
  trxId: text("trx_id").notNull(),
  status: text("status", { enum: verificationStatusValues }).notNull().default("pending"),
  // The withdrawal the user was attempting when verification was demanded.
  withdrawAmount: numeric("withdraw_amount", { precision: 14, scale: 2, mode: "number" }),
  withdrawMethod: text("withdraw_method", { enum: withdrawalMethodValues }),
  withdrawAccountNumber: text("withdraw_account_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequestsTable).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationRequest = typeof verificationRequestsTable.$inferSelect;
