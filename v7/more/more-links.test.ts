import { describe, expect, it } from 'vitest';

import {
  LINKEDIN_PROFILE_URL,
  UPWORK_PROFILE_URL,
  getContactUrl,
  getShareMessage,
  getStoreUrl,
  getWriteReviewUrl,
} from './more-links';

describe('getStoreUrl', () => {
  it('uses the App Store listing on iOS', () => {
    expect(getStoreUrl('ios')).toBe('https://apps.apple.com/app/id1333539401');
  });

  it('uses the Play Store listing elsewhere', () => {
    expect(getStoreUrl('android')).toContain(
      'play.google.com/store/apps/details?id=org.saravanakumar.reactnativecomponentsexplorer',
    );
  });
});

describe('getShareMessage', () => {
  it('embeds the platform store link', () => {
    expect(getShareMessage('ios')).toContain(getStoreUrl('ios'));
    expect(getShareMessage('android')).toContain(getStoreUrl('android'));
  });
});

describe('getWriteReviewUrl', () => {
  it('opens the App Store review form on iOS', () => {
    expect(getWriteReviewUrl('ios')).toBe(
      'itms-apps://itunes.apple.com/app/viewContentsUserReviews/id1333539401?action=write-review',
    );
  });

  it('opens the Play Store reviews on Android', () => {
    expect(getWriteReviewUrl('android')).toBe(
      'market://details?id=org.saravanakumar.reactnativecomponentsexplorer&showAllReviews=true',
    );
  });
});

describe('hiring profile links', () => {
  it('points at the right LinkedIn profile over https', () => {
    expect(LINKEDIN_PROFILE_URL).toBe('https://www.linkedin.com/in/saravanakumargn/');
  });

  it('keeps the Upwork share token intact', () => {
    expect(UPWORK_PROFILE_URL).toContain('upwork.com/freelancers/~0122abc6c72fe2144d');
    expect(UPWORK_PROFILE_URL).toContain('mp_source=share');
  });

  it('carries no campaign parameters, since neither platform reports them back', () => {
    for (const url of [LINKEDIN_PROFILE_URL, UPWORK_PROFILE_URL]) {
      expect(url.startsWith('https://')).toBe(true);
      expect(url).not.toContain('utm_');
    }
  });
});

describe('getContactUrl', () => {
  it('builds a mailto link with an encoded subject', () => {
    expect(getContactUrl()).toBe(
      'mailto:saravanakumargn@gmail.com?subject=React%20Native%20Components%20Explorer%3A%20Feedback',
    );
  });
});
