/**
 * VPN / Proxy detection via ip-api.com (free tier, no key required).
 *
 * Strategy (two-layer):
 *  1. ip-api.com `proxy` flag — flags the IP as a known proxy/VPN exit node.
 *  2. ISP/org name keyword check — if the ISP name matches a known commercial
 *     VPN provider we block it; if the name looks like a legitimate ISP we
 *     allow it even when the proxy flag is set.
 *
 * Why the two-layer approach?
 *  ip-api.com's `proxy` flag can misclassify some Bangladeshi WiFi ISPs
 *  (shared-NAT gateways that happen to be listed in proxy databases).
 *  Cross-checking the ISP name dramatically reduces false positives while
 *  still catching the major commercial VPN services.
 *
 * Rules:
 * - Private / loopback IPs → always safe (dev / LAN).
 * - Mobile carrier IPs (`mobile: true`) → always safe.
 * - If ip-api.com call fails → fail open (don't punish the user).
 */

export interface VpnCheckResult {
  isVpn: boolean;
  reason: string;
}

const PRIVATE_IP_RE =
  /^(127\.|::1$|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|fc|fd)/;

/**
 * Known commercial VPN / anonymiser provider keywords (lowercase).
 * Match against ISP + org fields combined.
 */
const VPN_PROVIDER_KEYWORDS = [
  'nordvpn', 'expressvpn', 'surfshark', 'ipvanish', 'cyberghost',
  'protonvpn', 'mullvad', 'pia', 'private internet access', 'hidemyass',
  'tunnelbear', 'windscribe', 'torguard', 'vyprvpn', 'purevpn',
  'hotspot shield', 'zenmate', 'ivpn', 'azirevpn', 'airvpn',
  'strongvpn', 'privatevpn', 'hide.me', 'astrill', 'perfectprivacy',
  'liquidvpn', 'fastestvpn', 'safervpn', 'boxpn', 'vpnsecure',
  'blazingseollc', 'blazing seo', 'bright data', 'luminati',
  'oxylabs', 'smartproxy', 'iproyal', 'soax', 'netnut',
  'tor exit', 'torproject', ' tor ',
  // generic VPN/proxy hosting keywords
  'vpn', 'anonymizer', 'anonymous proxy', 'proxy',
];

/**
 * Keywords that suggest a legitimate local/regional ISP.
 * If present, we skip blocking even when the proxy flag fires.
 */
const LEGIT_ISP_KEYWORDS = [
  // Bangladesh ISPs / telcos
  'grameenphone', 'gp ', 'robi', 'banglalink', 'teletalk', 'btcl',
  'bangladesh telephone', 'link3', 'amber', 'skytel', 'desh', 'metronet',
  'bracnet', 'agni', 'aamra', 'ranks', 'ispab', 'carnival',
  'banglalion', 'qubee', 'wimax',
  // Generic ISP markers
  'telecom', 'broadband', 'internet service', 'isp', 'fiber',
  'cable', 'dsl', 'adsl', 'vdsl',
];

function isKnownVpnProvider(isp: string, org: string): boolean {
  const combined = `${isp} ${org}`.toLowerCase();

  // If it matches a legit ISP keyword, never block.
  if (LEGIT_ISP_KEYWORDS.some((kw) => combined.includes(kw))) {
    return false;
  }

  // Block only if it matches a known VPN provider keyword.
  return VPN_PROVIDER_KEYWORDS.some((kw) => combined.includes(kw));
}

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
      `http://ip-api.com/json/${encodeURIComponent(cleanIp)}?fields=status,proxy,mobile,isp,org`,
      { signal: AbortSignal.timeout(4_000) },
    );

    if (!res.ok) return { isVpn: false, reason: '' };

    const data = (await res.json()) as {
      status: string;
      proxy: boolean;
      mobile: boolean;
      isp: string;
      org: string;
    };

    if (data.status !== 'success') return { isVpn: false, reason: '' };

    // Mobile carrier IPs are always legitimate (GP, Robi, Banglalink, etc.)
    if (data.mobile) return { isVpn: false, reason: '' };

    // proxy flag not set → clean
    if (!data.proxy) return { isVpn: false, reason: '' };

    // proxy flag set → double-check with ISP name
    if (isKnownVpnProvider(data.isp ?? '', data.org ?? '')) {
      return {
        isVpn: true,
        reason: 'VPN বা প্রক্সি সংযোগ শনাক্ত হয়েছে।',
      };
    }

    // proxy flag set but ISP looks like a legitimate provider → allow
    console.info(
      `[vpn-check] proxy flag set but ISP looks legitimate, allowing: ${cleanIp} ISP="${data.isp}" ORG="${data.org}"`,
    );
    return { isVpn: false, reason: '' };

  } catch (err) {
    // Fail open — don't punish users when ip-api.com is unreachable.
    console.warn('[vpn-check] IP lookup failed, allowing request:', cleanIp, err);
  }

  return { isVpn: false, reason: '' };
}
