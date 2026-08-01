/**
 * Entitlement identifiers and API keys ported from the old app
 * (backup_oldcode/src/constants/common.ts, backup_oldcode/src/utils/PurchaseUtils.ts).
 * Keys are read from EXPO_PUBLIC_REVENUECAT_*_API_KEY, never hardcoded — see .env.example.
 */
export const REVENUECAT_IOS_ENTITLEMENT_ID = 'RN_Learning_Premium';
export const REVENUECAT_ANDROID_ENTITLEMENT_ID = 'RN_Learning_Premium_android';

export function getEntitlementIdForPlatform(platformOS: string): string {
  return platformOS === 'ios' ? REVENUECAT_IOS_ENTITLEMENT_ID : REVENUECAT_ANDROID_ENTITLEMENT_ID;
}

export function resolveApiKeyForPlatform(
  platformOS: string,
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const key =
    platformOS === 'ios' ? env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY : env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  return key && key.length > 0 ? key : undefined;
}
