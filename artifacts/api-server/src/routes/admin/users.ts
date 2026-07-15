import { Router, type IRouter } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  BanUserParams,
  BanUserResponse,
  ClearFlaggedUserParams,
  ClearFlaggedUserResponse,
  ListAdminUsersQueryParams,
  ListAdminUsersResponse,
  UnbanUserParams,
  UnbanUserResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const query = ListAdminUsersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const search = query.data.search?.trim();
  const rows = await db
    .select()
    .from(usersTable)
    .where(
      search
        ? or(
            ilike(usersTable.firstName, `%${search}%`),
            ilike(usersTable.username, `%${search}%`),
            ilike(usersTable.telegramId, `%${search}%`),
          )
        : undefined,
    )
    .orderBy(usersTable.createdAt);

  res.json(ListAdminUsersResponse.parse(rows));
});

router.post("/admin/users/:id/ban", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = BanUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ isBanned: true })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json(BanUserResponse.parse(user));
});

router.post("/admin/users/:id/unban", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UnbanUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ isBanned: false })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json(UnbanUserResponse.parse(user));
});

router.post("/admin/flagged/:id/clear", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = ClearFlaggedUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ isFlagged: false, flagReason: null })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json(ClearFlaggedUserResponse.parse(user));
});

export default router;
