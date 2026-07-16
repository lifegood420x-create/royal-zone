/**
 * The public domain this deployment is reachable at, used to build the
 * Telegram webhook URL, Mini App links, and ad postback URLs.
 *
 * Resolution order:
 * - `REPLIT_DOMAINS` (comma-separated, Replit deployments)
 * - `RAILWAY_PUBLIC_DOMAIN` (set automatically by Railway once a domain
 *   is generated for the service)
 * - `PUBLIC_DOMAIN` (manual override for any other host)
 */
export function getPublicDomain(): string | null {
  const replitDomains = (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .filter(Boolean);
  return (
    replitDomains[0] ??
    process.env.RAILWAY_PUBLIC_DOMAIN ??
    process.env.PUBLIC_DOMAIN ??
    null
  );
}
