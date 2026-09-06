/**
 * Entitlement identifiers and API keys ported from the old app
 * (backup_oldcode/src/constants/common.ts, backup_oldcode/src/utils/PurchaseUtils.ts).
 * EXPO_PUBLIC_REVENUECAT_*_API_KEY overrides the built-in key when set, so a
 * different RevenueCat project can be used without a code change — see .env.example.
 */
/**
 * RevenueCat public SDK keys. These ship in the app binary by design, so they
 * are safe to commit. Re-exported as IAP_IOS_API_KEY / IAP_ANDROID_API_KEY from
 * `@/constants/common`; defined here so this module stays free of react-native
 * imports and remains unit-testable.
 */
export const REVENUECAT_IOS_API_KEY = 'appl_cmajYBeVEgGkBNgAokAwOTaaAMx';
export const REVENUECAT_ANDROID_API_KEY = 'goog_AwGSIBydQHouesRJJPOnTaxfupW';

export const REVENUECAT_IOS_ENTITLEMENT_ID = 'RN_Learning_Premium';
export const REVENUECAT_ANDROID_ENTITLEMENT_ID = 'RN_Learning_Premium_android';

export function getEntitlementIdForPlatform(platformOS: string): string {
  return platformOS === 'ios' ? REVENUECAT_IOS_ENTITLEMENT_ID : REVENUECAT_ANDROID_ENTITLEMENT_ID;
}

export function resolveApiKeyForPlatform(
  platformOS: string,
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const override =
    platformOS === 'ios' ? env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY : env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  if (override && override.length > 0) return override;
  return platformOS === 'ios' ? REVENUECAT_IOS_API_KEY : REVENUECAT_ANDROID_API_KEY;
}
