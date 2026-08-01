import { describe, expect, it } from 'vitest';
import { derivePurchaseInfo } from './purchase-info';

describe('derivePurchaseInfo', () => {
  it('is subscribed when the iOS entitlement is active', () => {
    const customerInfo = { entitlements: { active: { RN_Learning_Premium: {} } } };
    expect(derivePurchaseInfo(customerInfo, 'ios').isSubscribed).toBe(true);
  });

  it('is subscribed when the Android entitlement is active', () => {
    const customerInfo = { entitlements: { active: { RN_Learning_Premium_android: {} } } };
    expect(derivePurchaseInfo(customerInfo, 'android').isSubscribed).toBe(true);
  });

  it('is not subscribed when no entitlements are active', () => {
    const customerInfo = { entitlements: { active: {} } };
    expect(derivePurchaseInfo(customerInfo, 'ios').isSubscribed).toBe(false);
  });

  it('ignores entitlements for the other platform', () => {
    const customerInfo = { entitlements: { active: { RN_Learning_Premium_android: {} } } };
    expect(derivePurchaseInfo(customerInfo, 'ios').isSubscribed).toBe(false);
  });
});
