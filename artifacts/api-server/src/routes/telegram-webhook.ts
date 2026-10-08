import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { sendMessage } from "../lib/telegram";
import { upsertTelegramUser } from "../lib/users";
import { getAppConfig } from "../lib/config";
import { getPublicDomain } from "../lib/public-domain";

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
  const telegramId = String(message.from.id);
  const domain = getPublicDomain();
  // Telegram never includes a photo URL on bot chat updates (only Mini App
  // initData does). Point at our own lazy avatar proxy instead, which
  // fetches the real photo from the Bot API on demand — this keeps
  // referred friends' avatars from being permanently blank just because
  // they registered via /start instead of opening the Mini App first.
  const photoUrl = domain ? `https://${domain}/api/media/avatar/${telegramId}` : null;

  await upsertTelegramUser(
    {
      id: telegramId,
      username: message.from.username ?? null,
      firstName: message.from.first_name ?? "Telegram User",
      photoUrl,
    },
    { startParam, ip },
  );

  const config = await getAppConfig();
  const appUrl = domain ? `https://${domain}/` : null;

  try {
    await sendMessage(
      String(message.chat.id),
      `Monetage BD

এখন ঘরে বসেই ইনকাম করুন সহজে!

মনিটাইজ ডট পাবলিশ এর এড দেখা।

টেলিগ্রাম চ্যানেল সাবস্ক্রিপশন টাস্ক ।

ইউটিউব চ্যানেল সাবস্ক্রাইব ও ভিডিও দেখার কাজ ।

Daily Bonus

Instant Withdraw

Trusted & Professional Telegram Earning Platform

আজই জয়েন করুন এবং ইনকাম শুরু করুন!`,
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
