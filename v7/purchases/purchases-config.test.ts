import { describe, expect, it } from 'vitest';
import { getEntitlementIdForPlatform, resolveApiKeyForPlatform } from './purchases-config';

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

  it('reads the iOS key on ios', () => {
    expect(resolveApiKeyForPlatform('ios', env)).toBe('appl_test');
  });

  it('reads the Android key on android', () => {
    expect(resolveApiKeyForPlatform('android', env)).toBe('goog_test');
  });

  it('returns undefined when the key is missing', () => {
    expect(resolveApiKeyForPlatform('ios', {})).toBeUndefined();
  });

  it('returns undefined when the key is an empty string', () => {
    expect(resolveApiKeyForPlatform('ios', { EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: '' })).toBeUndefined();
  });
});
