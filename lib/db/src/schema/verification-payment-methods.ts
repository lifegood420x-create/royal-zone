import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentTypeValues = ["send_money", "cash_out"] as const;

/**
 * Admin-managed list of ways users can pay the account-verification fee
 * (bKash, Nagad, Upay, Rocket, ...). Each entry carries the receive number,
 * an optional logo, and whether the user should Send Money (personal) or
 * Cash Out (agent). Shown in the verification dialog alongside the legacy
 * app_config bKash/Nagad numbers.
 */
export const verificationPaymentMethodsTable = pgTable("verification_payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  accountNumber: text("account_number").notNull(),
  logoUrl: text("logo_url"),
  paymentType: text("payment_type", { enum: paymentTypeValues }).notNull().default("send_money"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVerificationPaymentMethodSchema = createInsertSchema(
  verificationPaymentMethodsTable,
).omit({ id: true, createdAt: true });
export type InsertVerificationPaymentMethod = z.infer<typeof insertVerificationPaymentMethodSchema>;
export type VerificationPaymentMethod = typeof verificationPaymentMethodsTable.$inferSelect;
