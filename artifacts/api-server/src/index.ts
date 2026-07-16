import app from "./app";
import { logger } from "./lib/logger";
import { getPublicDomain } from "./lib/public-domain";
import { getWebhookInfo, setWebhook } from "./lib/telegram";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  void ensureWebhookRegistered();
});

/**
 * Registers the Telegram webhook on boot if it isn't already pointed at
 * this deployment's domain. Without this, /start (and its referral code)
 * never reaches the server — Telegram just queues updates silently, which
 * then arrive all at once in a burst whenever the webhook is eventually
 * (re)configured, e.g. via the admin "Reset Webhook" button.
 *
 * Only runs in production. The dev workflow restarts frequently while
 * iterating (every code change, workflow restart, etc.), and each restart
 * used to steal the webhook away from the live production domain and point
 * it at the dev preview domain instead — silently breaking the bot in
 * production every time the agent touched the dev server. Dev/test webhook
 * registration must go through the admin panel's explicit "Reset Webhook"
 * action, never automatically on boot.
 */
async function ensureWebhookRegistered(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    logger.info("Skipping automatic Telegram webhook registration (not production).");
    return;
  }
  try {
    const domain = getPublicDomain();
    if (!domain) {
      logger.warn("No public domain available; skipping Telegram webhook registration.");
      return;
    }

    const expectedUrl = `https://${domain}/api/telegram/webhook`;
    const info = await getWebhookInfo();
    if (info.url === expectedUrl) return;

    await setWebhook(expectedUrl);
    logger.info({ expectedUrl, previousUrl: info.url || null, hadPendingUpdates: info.pending_update_count }, "Telegram webhook (re)registered on boot");
  } catch (error) {
    logger.warn({ error }, "Failed to auto-register Telegram webhook on boot");
  }
}
