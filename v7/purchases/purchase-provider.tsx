import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo } from 'react-native-purchases';

import { configurePurchases, isPurchasesConfigured } from './configure-purchases';
import { PurchaseContext } from './purchase-context';
import { derivePurchaseInfo } from './purchase-info';

/** Populates PurchaseContext once at app root, mirroring the old app's PurchaseProvider. */
export function PurchaseProvider({ children }: PropsWithChildren) {
  const [info, setInfo] = useState({ adsRemoved: false, learningUnlocked: false });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Configured here, not by a caller above us: React runs a child's effects
    // before its parent's, so a `configurePurchases()` in the root layout's
    // effect landed *after* this provider had already given up and reported
    // "nothing purchased". That is why a paying customer had to hit Restore on
    // every single launch — the first read always ran against an unconfigured
    // SDK, and nothing ever asked again. `configurePurchases` is idempotent, so
    // calling it on each refresh only costs the boolean check after the first.
    configurePurchases();
    if (!isPurchasesConfigured()) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.getCustomerInfo();
      setInfo(derivePurchaseInfo(customerInfo, Platform.OS));
    } catch (error) {
      if (error instanceof Error) console.error('PurchaseProvider: failed to fetch customer info:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    const nothing = { adsRemoved: false, learningUnlocked: false };
    configurePurchases();
    if (!isPurchasesConfigured()) return nothing;
    try {
      const restored = derivePurchaseInfo(await Purchases.restorePurchases(), Platform.OS);
      setInfo(restored);
      return restored;
    } catch (error) {
      if (error instanceof Error) console.error('PurchaseProvider: restore failed:', error.message);
      return nothing;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    configurePurchases();
    if (!isPurchasesConfigured()) return;

    // The startup read above can still come back empty — a cold start with no
    // network reaches the catch, and RevenueCat may only finish syncing the
    // store receipt moments later. The SDK pushes the corrected customer info
    // through this listener, so entitlements arrive on their own instead of
    // waiting for the customer to find the Restore button.
    const listener = (customerInfo: CustomerInfo) => {
      setInfo(derivePurchaseInfo(customerInfo, Platform.OS));
      setIsLoading(false);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const value = useMemo(
    () => ({ isLoading, adsRemoved: info.adsRemoved, learningUnlocked: info.learningUnlocked, refresh, restore }),
    [info.adsRemoved, info.learningUnlocked, isLoading, refresh, restore],
  );

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}
