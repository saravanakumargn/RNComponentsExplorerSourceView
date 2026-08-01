import { getEntitlementIdForPlatform } from './purchases-config';

/** Duck-typed subset of RevenueCat's CustomerInfo — decouples pure logic from the SDK's full type. */
type EntitlementsSource = {
  entitlements: {
    active: Record<string, unknown>;
  };
};

export type PurchaseInfo = {
  isSubscribed: boolean;
};

/** Mirrors the old app's getPurchaseInfo() (backup_oldcode/src/utils/PurchaseUtils.ts). */
export function derivePurchaseInfo(customerInfo: EntitlementsSource, platformOS: string): PurchaseInfo {
  const entitlementId = getEntitlementIdForPlatform(platformOS);
  return { isSubscribed: Boolean(customerInfo.entitlements.active[entitlementId]) };
}
