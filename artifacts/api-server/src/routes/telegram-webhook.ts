import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { sendMessage } from "../lib/telegram";
import { upsertTelegramUser } from "../lib/users";
import { getAppConfig } from "../lib/config";

const router: IRouter = Router();

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { id: number; username?: string; first_name?: string };
    text?: string;
  };
}

// Receives Telegram bot updates (configured via /admin/webhook/reset).
// Handles /start (with an optional referral code deep-link) by
// registering the user and replying with a button that opens the mini app.
router.post("/telegram/webhook", async (req, res): Promise<void> => {
  const update = req.body as TelegramUpdate;
  const message = update.message;

  if (!message?.from || !message.text?.startsWith("/start")) {
    res.sendStatus(200);
    return;
  }

  const startParam = message.text.split(" ")[1]?.trim() || null;
  const ip = null; // Telegram never carries a client IP for bot updates.

  await upsertTelegramUser(
    {
      id: String(message.from.id),
      username: message.from.username ?? null,
      firstName: message.from.first_name ?? "Telegram User",
      photoUrl: null,
    },
    { startParam, ip },
  );

  const config = await getAppConfig();
  const domains = (process.env.REPLIT_DOMAINS ?? "").split(",").filter(Boolean);
  const appUrl = domains[0] ? `https://${domains[0]}/` : null;

  try {
    await sendMessage(
      String(message.chat.id),
      `স্বাগতম ${message.from.first_name ?? ""}! ${config.botName}-এ বিজ্ঞাপন দেখুন, টাস্ক শেষ করুন এবং বন্ধুদের রেফার করে আয় করুন।`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              appUrl
                ? { text: "Open " + config.botName, web_app: { url: appUrl } }
                : { text: "Open " + config.botName, url: `https://t.me/${config.botUsername}` },
            ],
          ],
        },
      },
    );
  } catch (error) {
    logger.warn({ error }, "Failed to send Telegram welcome message");
  }

  res.sendStatus(200);
});

export default router;
