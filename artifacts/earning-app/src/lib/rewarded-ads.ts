/**
 * Rewarded ad loading — supports Monetag and Adsgram.
 */

export type AdNetwork = 'monetag' | 'adsgram';

const loadedScripts = new Set<string>();

function loadScript(src: string, attrs: Record<string, string> = {}): Promise<void> {
  if (loadedScripts.has(src)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    for (const [key, value] of Object.entries(attrs)) {
      script.setAttribute(key, value);
    }
    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ad script: ${src}`));
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    Adsgram?: {
      init: (opts: { blockId: string }) => {
        show: (params?: Record<string, string>) => Promise<void>;
      };
    };
    [key: `show_${string}`]: ((params?: Record<string, string>) => Promise<void>) | undefined;
  }
}

async function showMonetagAd(zoneId: string, requestVar?: string): Promise<void> {
  const fnName = `show_${zoneId}` as const;
  await loadScript('https://libtl.com/sdk.js', {
    'data-zone': zoneId,
    'data-sdk': fnName,
  });

  const trigger = window[fnName];
  if (typeof trigger !== 'function') {
    throw new Error('Monetag ad SDK failed to initialize.');
  }
  await trigger(requestVar ? { r: requestVar } : undefined);
}

async function showAdsgramAd(blockId: string, requestVar?: string): Promise<void> {
  await loadScript('https://sad.adsgram.ai/js/sad.min.js');

  if (!window.Adsgram) {
    throw new Error('Adsgram ad SDK failed to initialize.');
  }
  const controller = window.Adsgram.init({ blockId });
  await controller.show(requestVar ? { subid: requestVar } : undefined);
}

/** Wraps a Promise with a timeout — rejects if it doesn't resolve in time. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms / 1000}s. Please try again.`)),
      ms,
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/**
 * Show a rewarded ad. Resolves when the user finishes watching. Throws on failure.
 * Times out after 3 minutes to prevent the UI from freezing forever.
 */
export async function showRewardedAd(
  network: AdNetwork,
  zoneId: string | null,
  requestVar?: string,
): Promise<void> {
  if (!zoneId) {
    throw new Error(
      network === 'monetag'
        ? 'Monetag Zone ID এখনো সেট করা হয়নি।'
        : 'Adsgram Block ID এখনো সেট করা হয়নি।',
    );
  }
  const adPromise = network === 'monetag'
    ? showMonetagAd(zoneId, requestVar)
    : showAdsgramAd(zoneId, requestVar);

  await withTimeout(adPromise, 3 * 60 * 1000, `${network} ad`);
}

/** An admin-defined ad network row (from GET /ad-networks). */
export interface AdNetworkDef {
  name: string;
  sdkType: 'monetag' | 'adsgram' | 'custom';
  zoneId: string;
  sdkUrl?: string | null;
  callTemplate?: string | null;
}

function fillTemplate(template: string, zoneId: string, requestVar?: string): string {
  return template
    .replaceAll('{{ZONE_ID}}', zoneId)
    .replaceAll('{{REQUEST_VAR}}', requestVar ?? '');
}

/**
 * Custom network: load the admin-supplied SDK script (if any), then run the
 * admin-supplied call template (a JS expression, e.g. `window.showAd('{{ZONE_ID}}')`).
 * If no call template is set, the pasted script itself is expected to show the
 * ad, so it is re-injected fresh on every watch.
 */
async function showCustomAd(net: AdNetworkDef, requestVar?: string): Promise<void> {
  const sdkUrl = net.sdkUrl ? fillTemplate(net.sdkUrl, net.zoneId, requestVar) : null;

  if (!sdkUrl && !net.callTemplate) {
    throw new Error(`${net.name}: SDK URL বা Call Template — অন্তত একটা সেট করতে হবে।`);
  }

  if (sdkUrl && !net.callTemplate) {
    // Script-only network — the tag itself triggers the ad, so bypass the
    // load cache and inject a fresh copy each time.
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = sdkUrl;
      script.async = true;
      script.setAttribute('data-zone', net.zoneId);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ad script: ${sdkUrl}`));
      document.head.appendChild(script);
    });
    return;
  }

  if (sdkUrl) {
    await loadScript(sdkUrl, { 'data-zone': net.zoneId });
  }

  const code = fillTemplate(net.callTemplate!, net.zoneId, requestVar);
  // eslint-disable-next-line no-new-func
  const result = new Function(`"use strict"; return (${code});`)();
  await Promise.resolve(result);
}

/**
 * Show a rewarded ad for an admin-defined network (built-in SDK types reuse
 * the Monetag/Adsgram loaders with the network's own zone/block id).
 */
export async function showNetworkAd(net: AdNetworkDef, requestVar?: string): Promise<void> {
  const adPromise =
    net.sdkType === 'monetag'
      ? showMonetagAd(net.zoneId, requestVar)
      : net.sdkType === 'adsgram'
        ? showAdsgramAd(net.zoneId, requestVar)
        : showCustomAd(net, requestVar);

  await withTimeout(adPromise, 3 * 60 * 1000, `${net.name} ad`);
}
