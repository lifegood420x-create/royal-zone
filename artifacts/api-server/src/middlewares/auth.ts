import type { NextFunction, Request, Response } from "express";
import type { User } from "@workspace/db";
import { verifyInitData, type TelegramUserInfo } from "../lib/telegram";
import { upsertTelegramUser } from "../lib/users";
import { getAppConfig } from "../lib/config";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: User;
      isAdmin?: boolean;
    }
  }
}

function isDevBypassAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

function parseDevToken(token: string): TelegramUserInfo | null {
  if (!token.startsWith("dev:")) return null;
  const id = token.slice("dev:".length).trim();
  if (!id) return null;
  return {
    id: `dev-${id}`,
    username: "admin",
    firstName: "Dev Admin",
    photoUrl: null,
  };
}

function normalizeUsername(value: string | null): string {
  return (value ?? "").replace(/^@/, "").trim().toLowerCase();
}

/**
 * Authenticates the request via the Telegram initData carried in the
 * `Authorization: Bearer <initData>` header, upserts the corresponding
 * user, and attaches `req.currentUser` / `req.isAdmin`.
 *
 * In non-production environments, a `Bearer dev:<id>` token bypasses real
 * Telegram verification so the app is testable outside Telegram (e.g. the
 * Replit preview browser).
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json({ error: "Missing Telegram authentication." });
    return;
  }

  let telegramUser: TelegramUserInfo | null = null;
  let startParam: string | null = null;

  if (isDevBypassAllowed()) {
    telegramUser = parseDevToken(token);
  }

  if (!telegramUser) {
    const verified = verifyInitData(token);
    if (!verified) {
      res.status(401).json({ error: "Invalid Telegram authentication." });
      return;
    }
    telegramUser = verified.user;
    startParam = verified.startParam;
  }

  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? req.ip ?? null;

  const user = await upsertTelegramUser(telegramUser, { startParam, ip });

  if (user.isBanned) {
    res.status(403).json({ error: "This account has been banned." });
    return;
  }

  const config = await getAppConfig();
  req.currentUser = user;
  req.isAdmin = normalizeUsername(user.username) === normalizeUsername(config.adminUsername);

  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.isAdmin) {
    res.status(403).json({ error: "Admin access required." });
    return;
  }
  next();
}
