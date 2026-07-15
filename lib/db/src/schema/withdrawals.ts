import { integer, pgTable, serial, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const withdrawalMethodValues = ["bkash", "nagad"] as const;
export const withdrawalStatusValues = ["pending", "paid", "rejected"] as const;

export const withdrawalsTable = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  method: text("method", { enum: withdrawalMethodValues }).notNull(),
  accountNumber: text("account_number").notNull(),
  status: text("status", { enum: withdrawalStatusValues }).notNull().default("pending"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  note: text("note"),
});

export const insertWithdrawalSchema = createInsertSchema(withdrawalsTable).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
});
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawalsTable.$inferSelect;
