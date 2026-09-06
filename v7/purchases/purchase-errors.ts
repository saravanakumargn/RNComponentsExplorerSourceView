import { PURCHASES_ERROR_CODE, type PurchasesError } from 'react-native-purchases';

/**
 * RevenueCat surfaces store-setup problems (no StoreKit configuration file on
 * the Simulator, products still in "Missing Metadata", an unsigned Paid Apps
 * agreement) as a multi-paragraph developer message with rev.cat links in it.
 * That is useful in the logs but must never reach a buyer, so it is collapsed
 * into the same copy used for an empty offering.
 */
const STORE_UNAVAILABLE_ERROR_CODES: string[] = [
  PURCHASES_ERROR_CODE.CONFIGURATION_ERROR,
  PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR,
  PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR,
  PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR,
  PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR,
];

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

export function isStoreUnavailableError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  return STORE_UNAVAILABLE_ERROR_CODES.includes(String((error as PurchasesError).code));
}

export function isUserCancelledError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if ('userCancelled' in error && error.userCancelled === true) return true;
  return 'code' in error && String((error as PurchasesError).code) === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}

/**
 * Maps a RevenueCat failure to buyer-facing copy. `unavailableMessage` is the
 * wording to use when the store itself has nothing to sell, which each screen
 * phrases in its own terms ("plans" vs "support options").
 */
export function purchaseErrorMessage(error: unknown, unavailableMessage: string): string {
  if (isStoreUnavailableError(error)) {
    if (__DEV__) console.warn('RevenueCat store unavailable:', error);
    return unavailableMessage;
  }
  return error instanceof Error ? error.message : GENERIC_MESSAGE;
}
