/**
 * VPN / Proxy detection via ip-api.com (free tier, no key required).
 * Returns isVpn=true if the IP is flagged as a proxy, VPN, or datacenter host.
 *
 * Rules:
 * - Private / loopback IPs are always treated as safe (dev / LAN).
 * - If the external call fails we fail open (don't block the user).
 */

export interface VpnCheckResult {
  isVpn: boolean;
  reason: string;
}

const PRIVATE_IP_RE =
  /^(127\.|::1$|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|fc|fd)/;

export async function checkIpForVpn(
  ip: string | null | undefined,
): Promise<VpnCheckResult> {
  if (!ip) return { isVpn: false, reason: '' };

  // Strip IPv6-mapped IPv4 prefix: "::ffff:1.2.3.4" → "1.2.3.4"
  const cleanIp = ip.replace(/^::ffff:/, '');

  if (PRIVATE_IP_RE.test(cleanIp)) {
    return { isVpn: false, reason: '' };
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(cleanIp)}?fields=status,proxy,hosting`,
      { signal: AbortSignal.timeout(4_000) },
    );

    if (!res.ok) return { isVpn: false, reason: '' };

    const data = (await res.json()) as {
      status: string;
      proxy: boolean;
      hosting: boolean;
    };

    if (data.status === 'success' && (data.proxy || data.hosting)) {
      const tags: string[] = [];
      if (data.proxy) tags.push('proxy/VPN');
      if (data.hosting) tags.push('datacenter/hosting');
      return {
        isVpn: true,
        reason: `Suspicious IP detected (${tags.join(', ')}). Ad rewards blocked.`,
      };
    }
  } catch (err) {
    // Fail open — don't punish users when ip-api.com is unreachable.
    console.warn('[vpn-check] IP lookup failed, allowing request:', cleanIp, err);
  }

  return { isVpn: false, reason: '' };
}
