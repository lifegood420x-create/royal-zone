import { Router, type IRouter } from "express";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db, tasksTable, taskCompletionsTable } from "@workspace/db";
import {
  CreateTaskBody,
  CreateTaskResponse,
  DeleteTaskParams,
  ListAdminTasksResponse,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/tasks", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tasksTable)
    .where(isNull(tasksTable.deletedAt))
    .orderBy(desc(tasksTable.createdAt));
  res.json(ListAdminTasksResponse.parse(rows));
});

router.post("/admin/tasks", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [task] = await db
    .insert(tasksTable)
    .values({ ...parsed.data, isActive: parsed.data.isActive ?? true })
    .returning();

  res.status(201).json(CreateTaskResponse.parse(task));
});

router.patch("/admin/tasks/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [task] = await db
    .update(tasksTable)
    .set(parsed.data)
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found." });
    return;
  }

  res.json(UpdateTaskResponse.parse(task));
});

router.delete("/admin/tasks/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Tasks that users have already completed are referenced by
  // task_completions (reward history) via a foreign key with no cascade —
  // hard-deleting them would violate that constraint and 500. Preserve the
  // completion/reward history and just deactivate the task instead so it
  // disappears from the user-facing task list.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(taskCompletionsTable)
    .where(eq(taskCompletionsTable.taskId, params.data.id));

  if (count > 0) {
    const [task] = await db
      .update(tasksTable)
      .set({ isActive: false, deletedAt: new Date() })
      .where(and(eq(tasksTable.id, params.data.id), isNull(tasksTable.deletedAt)))
      .returning();
    if (!task) {
      res.status(404).json({ error: "Task not found." });
      return;
    }
    res.sendStatus(204);
    return;
  }

  const [task] = await db.delete(tasksTable).where(eq(tasksTable.id, params.data.id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found." });
    return;
  }

  res.sendStatus(204);
});

export default router;
