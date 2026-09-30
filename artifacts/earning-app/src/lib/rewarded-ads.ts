/**
 * Rewarded ad loading — GigaPub.
 */

const GIGAPUB_SCRIPT = 'https://ad.gigapub.tech/script?id=8416';

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
    showGiga?: () => Promise<void>;
  }
}

async function showGigaPubAd(): Promise<void> {
  await loadScript(GIGAPUB_SCRIPT);

  if (typeof window.showGiga !== 'function') {
    throw new Error('GigaPub ad SDK failed to initialize.');
  }
  await window.showGiga();
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
export async function showRewardedAd(): Promise<void> {
  await withTimeout(showGigaPubAd(), 3 * 60 * 1000, 'GigaPub ad');
}
