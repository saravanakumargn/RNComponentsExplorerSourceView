import { describe, expect, it } from 'vitest';
import {
  REVENUECAT_ANDROID_API_KEY,
  REVENUECAT_IOS_API_KEY,
  getEntitlementIdForPlatform,
  resolveApiKeyForPlatform,
} from './purchases-config';

describe('getEntitlementIdForPlatform', () => {
  it.each([
    ['ios', 'RN_Learning_Premium'],
    ['android', 'RN_Learning_Premium_android'],
    ['web', 'RN_Learning_Premium_android'],
  ])('maps %s to %s', (platformOS, expected) => {
    expect(getEntitlementIdForPlatform(platformOS)).toBe(expected);
  });
});

describe('resolveApiKeyForPlatform', () => {
  const env = {
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: 'goog_test',
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: 'appl_test',
  };

  it('prefers the iOS env override on ios', () => {
    expect(resolveApiKeyForPlatform('ios', env)).toBe('appl_test');
  });

  it('prefers the Android env override on android', () => {
    expect(resolveApiKeyForPlatform('android', env)).toBe('goog_test');
  });

  it('falls back to the built-in key when the override is missing', () => {
    expect(resolveApiKeyForPlatform('ios', {})).toBe(REVENUECAT_IOS_API_KEY);
    expect(resolveApiKeyForPlatform('android', {})).toBe(REVENUECAT_ANDROID_API_KEY);
  });

  it('falls back to the built-in key when the override is an empty string', () => {
    expect(resolveApiKeyForPlatform('ios', { EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: '' })).toBe(
      REVENUECAT_IOS_API_KEY,
    );
  });
});
