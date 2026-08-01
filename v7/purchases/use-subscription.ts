import { useContext } from 'react';

import { PurchaseContext } from './purchase-context';

/** { isSubscribed, isLoading, refresh, restore } — read from PurchaseProvider's context. */
export function useSubscription() {
  return useContext(PurchaseContext);
}
