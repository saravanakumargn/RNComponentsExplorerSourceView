type CatalogBackHandler = () => void;

let catalogBackHandler: CatalogBackHandler | undefined;

export function setCatalogBackHandler(handler: CatalogBackHandler) {
  catalogBackHandler = handler;

  return () => {
    if (catalogBackHandler === handler) {
      catalogBackHandler = undefined;
    }
  };
}

export function goBackToCatalog() {
  catalogBackHandler?.();
}
