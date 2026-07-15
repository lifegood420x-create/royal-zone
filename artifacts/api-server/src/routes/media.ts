import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { fetchTelegramAvatar } from "../lib/telegram";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Public, lazily-fetched avatar proxy. `<img>` tags can't send our
// Authorization header, so this only accepts a telegramId that already
// belongs to a known user (never fetches arbitrary Telegram user ids), and
// never exposes the bot token to the client — the token stays server-side
// inside fetchTelegramAvatar.
router.get("/media/avatar/:telegramId", async (req, res): Promise<void> => {
  const { telegramId } = req.params;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId));
  if (!user) {
    res.sendStatus(404);
    return;
  }

  try {
    const photo = await fetchTelegramAvatar(telegramId);
    if (!photo) {
      res.sendStatus(404);
      return;
    }
    res.set("Content-Type", photo.contentType);
    res.set("Cache-Control", "public, max-age=3600");
    res.send(photo.buffer);
  } catch (error) {
    logger.warn({ error, telegramId }, "Failed to fetch Telegram avatar");
    res.sendStatus(404);
  }
});

export default router;
