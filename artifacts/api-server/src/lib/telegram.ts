import crypto from "crypto";
import { logger } from "./logger";

const TELEGRAM_API_BASE = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN must be set to use the Telegram bot API.");
  }
  return token;
}

export interface TelegramUserInfo {
  id: string;
  username: string | null;
  firstName: string;
  photoUrl: string | null;
}

/**
 * Verifies a Telegram Mini App `initData` string using the documented HMAC
 * scheme (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).
 * Returns the parsed user info when valid, or `null` when the signature is
 * missing/invalid/expired.
 */
export function verifyInitData(initData: string): {
  user: TelegramUserInfo;
  startParam: string | null;
} | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(getBotToken()).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) {
    return null;
  }

  const authDate = Number(params.get("auth_date") ?? "0");
  const maxAgeSeconds = 60 * 60 * 24; // 24h
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSeconds) {
    return null;
  }

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let parsedUser: { id: number; username?: string; first_name?: string; photo_url?: string };
  try {
    parsedUser = JSON.parse(userRaw);
  } catch {
    return null;
  }

  return {
    user: {
      id: String(parsedUser.id),
      username: parsedUser.username ?? null,
      firstName: parsedUser.first_name ?? "Telegram User",
      photoUrl: parsedUser.photo_url ?? null,
    },
    startParam: params.get("start_param"),
  };
}

async function callTelegramApi<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${TELEGRAM_API_BASE}/bot${getBotToken()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!data.ok) {
    throw new Error(data.description ?? `Telegram API call to ${method} failed`);
  }
  return data.result as T;
}

export function sendMessage(chatId: string, text: string, extra?: Record<string, unknown>) {
  return callTelegramApi("sendMessage", { chat_id: chatId, text, ...extra });
}

export interface WebhookInfo {
  url: string;
  pending_update_count: number;
  last_error_message?: string;
}

export function getWebhookInfo() {
  return callTelegramApi<WebhookInfo>("getWebhookInfo");
}

export function setWebhook(url: string) {
  return callTelegramApi<boolean>("setWebhook", { url });
}

interface UserProfilePhotos {
  total_count: number;
  photos: { file_id: string; file_size?: number }[][];
}

interface TelegramFile {
  file_id: string;
  file_path?: string;
}

/**
 * Fetches a Telegram user's current profile-photo bytes via the Bot API.
 * Used as a fallback for users who registered through the `/start` webhook
 * (where Telegram never includes a photo URL), so their avatar can still
 * show up once they have a public profile photo. Returns `null` when the
 * user has no photo or it can't be retrieved (e.g. privacy settings).
 */
export async function fetchTelegramAvatar(
  telegramUserId: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const numericId = Number(telegramUserId);
  if (!Number.isFinite(numericId)) return null;

  const photos = await callTelegramApi<UserProfilePhotos>("getUserProfilePhotos", {
    user_id: numericId,
    limit: 1,
  });
  const smallestSize = photos.photos[0]?.[0];
  if (!smallestSize) return null;

  const file = await callTelegramApi<TelegramFile>("getFile", { file_id: smallestSize.file_id });
  if (!file.file_path) return null;

  const response = await fetch(`${TELEGRAM_API_BASE}/file/bot${getBotToken()}/${file.file_path}`);
  if (!response.ok) return null;

  const extension = file.file_path.split(".").pop()?.toLowerCase();
  const contentType = extension === "png" ? "image/png" : "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

/** Sends a message to every user, tolerating individual failures (blocked bot, etc). */
export async function broadcastMessage(chatIds: string[], text: string) {
  let sentCount = 0;
  let failedCount = 0;
  for (const chatId of chatIds) {
    try {
      await sendMessage(chatId, text);
      sentCount += 1;
    } catch (error) {
      failedCount += 1;
      logger.warn({ chatId, error }, "Failed to deliver broadcast message");
    }
  }
  return { sentCount, failedCount };
}
