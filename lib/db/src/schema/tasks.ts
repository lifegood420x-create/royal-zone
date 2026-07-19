import { boolean, integer, pgTable, serial, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const taskTypeValues = [
  "youtube",
  "facebook",
  "telegram",
  "join_bonus",
  "bonus",
  "other",
] as const;

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  reward: numeric("reward", { precision: 14, scale: 2, mode: "number" }).notNull(),
  type: text("type", { enum: taskTypeValues }).notNull().default("other"),
  link: text("link"),
  // For Telegram tasks: channel/group username (@chan) or numeric ID (-100xxx).
  // Used to verify membership via getChatMember. Required for private invite
  // links where the username cannot be extracted from the link alone.
  telegramChatId: text("telegram_chat_id"),
  isActive: boolean("is_active").notNull().default(true),
  // Set when an admin "deletes" a task that already has completions (see
  // admin/tasks.ts) — the row can't be hard-deleted without breaking the
  // task_completions foreign key / reward history, so it's hidden from the
  // admin list via this flag instead of relying on isActive (which users
  // also read to decide what shows in their task list).
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;

export const taskCompletionsTable = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasksTable.id),
  reward: numeric("reward", { precision: 14, scale: 2, mode: "number" }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletionsTable).omit({
  id: true,
  completedAt: true,
});
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type TaskCompletion = typeof taskCompletionsTable.$inferSelect;
