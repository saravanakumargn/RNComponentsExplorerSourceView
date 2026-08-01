import { createContext } from 'react';

export type PurchaseContextValue = {
  isLoading: boolean;
  isSubscribed: boolean;
  refresh: () => Promise<void>;
  restore: () => Promise<boolean>;
};

export const PurchaseContext = createContext<PurchaseContextValue>({
  isLoading: true,
  isSubscribed: false,
  refresh: async () => {},
  restore: async () => false,
});
