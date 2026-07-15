/**
 * Rewarded ad loading for Monetag and Adsgram.
 *
 * Zone/block IDs are NOT hardcoded — they come from the public app config
 * (`GET /config/public`, fields `monetagZoneId` / `adsgramBlockId`), which
 * the admin sets from the Config tab. If a zone ID is not configured yet,
 * `showRewardedAd` throws so the caller can show a friendly "ads not set up
 * yet" message instead of a broken button.
 *
 * NOTE: The exact Monetag/Adsgram snippet may be swapped in later once the
 * final SDK script is provided. This implements the documented public
 * in-app interstitial APIs for both networks.
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
        show: () => Promise<void>;
      };
    };
    [key: `show_${string}`]: (() => Promise<void>) | undefined;
  }
}

async function showMonetagAd(zoneId: string): Promise<void> {
  const fnName = `show_${zoneId}` as const;
  await loadScript('https://libtl.com/sdk.js', {
    'data-zone': zoneId,
    'data-sdk': fnName,
  });

  const trigger = window[fnName];
  if (typeof trigger !== 'function') {
    throw new Error('Monetag ad SDK failed to initialize.');
  }
  await trigger();
}

async function showAdsgramAd(blockId: string): Promise<void> {
  await loadScript('https://sad.adsgram.ai/js/sad.min.js');

  if (!window.Adsgram) {
    throw new Error('Adsgram ad SDK failed to initialize.');
  }
  const controller = window.Adsgram.init({ blockId });
  await controller.show();
}

/**
 * Shows a rewarded ad for the given network and resolves once the viewer
 * has watched it. Throws if the network isn't configured or the SDK fails
 * to load/show — callers should NOT credit the reward unless this resolves.
 */
export async function showRewardedAd(network: AdNetwork, zoneId: string | null): Promise<void> {
  if (!zoneId) {
    throw new Error(
      network === 'monetag'
        ? 'Monetag zone ID is not configured yet.'
        : 'Adsgram block ID is not configured yet.',
    );
  }

  if (network === 'monetag') {
    await showMonetagAd(zoneId);
  } else {
    await showAdsgramAd(zoneId);
  }
}
