/**
 * @file Configuration file for your app's RevenueCat settings.
 * @author Vadim Savin
 */

import {Platform} from 'react-native';

// EXPLORER ADAPTATION: upstream ships placeholder strings here and logs a
// console.error telling you to replace them. The explorer already owns a
// RevenueCat project, so the example reads that project's public SDK key and
// entitlement identifier instead. Everything else in this example is untouched.
import {
  getEntitlementIdForPlatform,
  resolveApiKeyForPlatform,
} from '@/features/purchases/purchases-config';

/*
 The API key for your app from the RevenueCat dashboard: https://app.revenuecat.com
 */
export const API_KEY = Platform.select({
  ios: resolveApiKeyForPlatform('ios'),
  android: resolveApiKeyForPlatform('android'),
});

/*
 The entitlement ID from the RevenueCat dashboard that is activated upon successful in-app purchase for the duration of the purchase.
 */
export const ENTITLEMENT_ID = getEntitlementIdForPlatform(Platform.OS);
