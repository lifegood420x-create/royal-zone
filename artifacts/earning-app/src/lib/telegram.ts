import { setAuthTokenGetter } from '@workspace/api-client-react';

// Minimal shape of the Telegram WebApp SDK we rely on. The real SDK is much
// larger; we only type what we use.
interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  platform?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

/**
 * Returns the raw Telegram `initData` string for the current session.
 *
 * When the app is opened outside of Telegram (e.g. the Replit preview, or a
 * plain browser during development), there is no real initData. In that
 * case we fall back to a `dev:<id>` token that the API server only accepts
 * when it is NOT running in production, so real users are never affected.
 */
export function getAuthToken(): string | null {
  const webApp = getTelegramWebApp();
  if (webApp?.initData) {
    return webApp.initData;
  }

  if (import.meta.env.DEV) {
    return 'dev:1';
  }

  return null;
}

/** Extracts the `?startapp=` / `start_param` referral code, if present. */
export function getStartParam(): string | null {
  const webApp = getTelegramWebApp();
  const fromTelegram = webApp?.initDataUnsafe?.start_param;
  if (fromTelegram) return fromTelegram;

  const url = new URL(window.location.href);
  return url.searchParams.get('startapp') ?? url.searchParams.get('start_param');
}

/**
 * Call once, before the app renders. Wires up the Orval auth token getter so
 * every generated API call carries the Telegram identity, and initializes
 * the Telegram WebApp chrome (expand to full height, disable edge swipes).
 */
export function bootstrapTelegram(): void {
  setAuthTokenGetter(() => getAuthToken());

  const webApp = getTelegramWebApp();
  if (!webApp) return;

  webApp.ready();
  webApp.expand();
  webApp.disableVerticalSwipes?.();
  webApp.setHeaderColor?.('#F5F8FC');
  webApp.setBackgroundColor?.('#F5F8FC');
}
