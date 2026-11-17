// AdsGram Rewarded Video Ad Integration

export interface AdsgramInitParams {
  blockId: string;
  debug?: boolean;
}

export interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'reward';
  error: boolean;
}

declare global {
  interface Window {
    Adsgram?: {
      init: (params: AdsgramInitParams) => {
        show: () => Promise<ShowPromiseResult>;
      };
    };
  }
}

// Load AdsGram script dynamically
export const loadAdsgramScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Adsgram) return resolve(true);

    const existingScript = document.querySelector('script[src*="adsgram"]');
    if (existingScript) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://sad.adsgram.ai/js/sad.min.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('AdsGram script could not be loaded from CDN. Demo simulation will be used.');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

export type AdShowResult =
  | { success: true; isRealAd: boolean }
  | { success: false; error: string; isRealAd: boolean };

export const showRewardedAd = async (): Promise<AdShowResult> => {
  const blockId = import.meta.env.VITE_ADSGRAM_BLOCK_ID;

  // If no AdsGram block ID is provided, signal to use interactive demo simulator
  if (!blockId || blockId.trim() === '' || blockId === 'YOUR_ADSGRAM_BLOCK_ID') {
    return { success: false, error: 'NO_BLOCK_ID', isRealAd: false };
  }

  try {
    const isLoaded = await loadAdsgramScript();
    if (!isLoaded || !window.Adsgram) {
      return { success: false, error: 'SCRIPT_NOT_LOADED', isRealAd: false };
    }

    const adController = window.Adsgram.init({
      blockId,
      debug: import.meta.env.DEV,
    });

    const res = await adController.show();

    if (res.done) {
      return { success: true, isRealAd: true };
    } else {
      return { success: false, error: res.description || 'Ad was skipped before completion', isRealAd: true };
    }
  } catch (err: unknown) {
    const errorMsg =
      err && typeof err === 'object' && 'description' in err
        ? String((err as { description: unknown }).description)
        : 'Failed to display AdsGram ad';
    return { success: false, error: errorMsg, isRealAd: true };
  }
};
