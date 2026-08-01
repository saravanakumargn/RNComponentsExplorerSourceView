import { createContext, useContext } from 'react';

const BackToCatalogContext = createContext<(() => void) | null>(null);

export const BackToCatalogProvider = BackToCatalogContext.Provider;

export function useBackToCatalog() {
  return useContext(BackToCatalogContext);
}
