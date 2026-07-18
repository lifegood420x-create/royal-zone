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
