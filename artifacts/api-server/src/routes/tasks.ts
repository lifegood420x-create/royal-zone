import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, tasksTable, taskCompletionsTable, usersTable } from "@workspace/db";
import { CompleteTaskParams, CompleteTaskResponse, ListTasksResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { toApiUser } from "../lib/serialize";

const router: IRouter = Router();

router.get("/tasks", requireAuth, async (req, res): Promise<void> => {
  const userId = req.currentUser!.id;
  const [tasks, completions] = await Promise.all([
    db.select().from(tasksTable).where(eq(tasksTable.isActive, true)),
    db.select().from(taskCompletionsTable).where(eq(taskCompletionsTable.userId, userId)),
  ]);

  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  const data = ListTasksResponse.parse(
    tasks.map((task) => ({ ...task, completed: completedTaskIds.has(task.id) })),
  );
  res.json(data);
});

router.post("/tasks/:id/complete", requireAuth, async (req, res): Promise<void> => {
  const params = CompleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task || !task.isActive) {
    res.status(404).json({ error: "Task not found." });
    return;
  }

  const userId = req.currentUser!.id;
  const [existingCompletion] = await db
    .select()
    .from(taskCompletionsTable)
    .where(and(eq(taskCompletionsTable.userId, userId), eq(taskCompletionsTable.taskId, task.id)));

  if (existingCompletion) {
    res.status(409).json({ error: "Task already completed." });
    return;
  }

  const [completion] = await db
    .insert(taskCompletionsTable)
    .values({ userId, taskId: task.id, reward: task.reward })
    .returning();

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      balance: (req.currentUser!.balance + task.reward),
      totalEarned: (req.currentUser!.totalEarned + task.reward),
      totalTasksCount: req.currentUser!.totalTasksCount + 1,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  const data = CompleteTaskResponse.parse({
    user: await toApiUser(updatedUser),
    completion,
  });
  res.json(data);
});

export default router;
