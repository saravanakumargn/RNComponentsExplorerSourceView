import { createContext } from 'react';

import type { PurchaseInfo } from './purchase-info';

export type PurchaseContextValue = {
  isLoading: boolean;
  /** No ads. Bought by any purchase, including a pure tip. */
  adsRemoved: boolean;
  /** The learning library is readable in full. Bought only by the learning purchase. */
  learningUnlocked: boolean;
  refresh: () => Promise<void>;
  /**
   * Resolves to what the restore actually recovered. Both capabilities, not
   * just the library: an ads-only restore is a real restore, and reporting it
   * as nothing found is what made customers think their purchase was lost.
   */
  restore: () => Promise<PurchaseInfo>;
};

export const PurchaseContext = createContext<PurchaseContextValue>({
  isLoading: true,
  adsRemoved: false,
  learningUnlocked: false,
  refresh: async () => {},
  restore: async () => ({ adsRemoved: false, learningUnlocked: false }),
});
