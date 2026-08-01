import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

import { isPurchasesConfigured } from './configure-purchases';
import { PurchaseContext } from './purchase-context';
import { derivePurchaseInfo } from './purchase-info';

/** Populates PurchaseContext once at app root, mirroring the old app's PurchaseProvider. */
export function PurchaseProvider({ children }: PropsWithChildren) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isPurchasesConfigured()) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.getCustomerInfo();
      setIsSubscribed(derivePurchaseInfo(customerInfo, Platform.OS).isSubscribed);
    } catch (error) {
      if (error instanceof Error) console.error('PurchaseProvider: failed to fetch customer info:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    if (!isPurchasesConfigured()) return false;
    try {
      const customerInfo = await Purchases.restorePurchases();
      const { isSubscribed: restored } = derivePurchaseInfo(customerInfo, Platform.OS);
      setIsSubscribed(restored);
      return restored;
    } catch (error) {
      if (error instanceof Error) console.error('PurchaseProvider: restore failed:', error.message);
      return false;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ isLoading, isSubscribed, refresh, restore }),
    [isLoading, isSubscribed, refresh, restore],
  );

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}
