import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { getTelegramWebApp } from '../lib/telegram';

/** Nested user routes that should show Telegram's native BackButton. */
const BACK_MAP: Record<string, string> = {
  '/profile': '/settings',
  '/withdraw': '/settings',
  '/refer': '/settings',
  '/rules': '/profile',
};

export function useTelegramBackButton() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const back = getTelegramWebApp()?.BackButton;
    if (!back) return;

    const parent = BACK_MAP[location];
    if (!parent) {
      back.hide();
      return;
    }

    const handler = () => setLocation(parent);
    back.onClick(handler);
    back.show();

    return () => {
      back.offClick(handler);
      back.hide();
    };
  }, [location, setLocation]);
}
