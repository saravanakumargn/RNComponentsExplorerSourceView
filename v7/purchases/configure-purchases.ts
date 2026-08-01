import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

import { resolveApiKeyForPlatform } from './purchases-config';

let didConfigure = false;

export function isPurchasesConfigured(): boolean {
  return didConfigure;
}

/**
 * Initializes the RevenueCat SDK once at app start, mirroring the old app's
 * Purchases.configure call (backup_oldcode/src/app/_layout.tsx). No-ops (with a
 * warning) when no API key is set, so the app still runs without a .env.local.
 */
export function configurePurchases(): void {
  if (didConfigure) return;

  const apiKey = resolveApiKeyForPlatform(Platform.OS);
  if (!apiKey) {
    console.warn(
      'RevenueCat: no EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY set — ' +
        'subscription features are disabled. Copy .env.example to .env.local and fill in real keys.',
    );
    return;
  }

  try {
    Purchases.configure({ apiKey, appUserID: null });
    didConfigure = true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('RevenueCat configure error:', error.message);
    }
  }
}
