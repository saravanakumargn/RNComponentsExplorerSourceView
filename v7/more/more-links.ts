/**
 * Pure link/message builders for the More tab, ported from the old app
 * (backup_oldcode/src/utils/CommonUtils.ts, src/constants/common.ts).
 * Kept free of react-native imports so it stays unit-testable.
 */
export const ANDROID_PACKAGE_NAME = 'org.saravanakumar.reactnativecomponentsexplorer';
export const IOS_APP_ID = '1333539401';

export const TERMS_URL = 'https://saravanakumargn.github.io/js-learning-app/terms-and-conditions.html';
export const PRIVACY_URL = 'https://saravanakumargn.github.io/js-learning-app/privacy-policy.html';
export const FEEDBACK_FORM_URL = 'https://forms.gle/sTGLbaNbrYNQadcm6';
export const SUPPORT_EMAIL = 'saravanakumargn@gmail.com';

export const SHARE_TITLE = 'Spread the RN Magic! ✨';

/**
 * Freelance profiles linked from the More tab's "Work with me" section. Neither
 * platform reports campaign parameters back, so these stay untagged and the
 * `hire_*_opened` analytics events are what measure interest instead.
 */
export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/saravanakumargn/';
export const UPWORK_PROFILE_URL =
  'https://www.upwork.com/freelancers/~0122abc6c72fe2144d?mp_source=share';

/** Public store listing for the given platform. */
export function getStoreUrl(platformOS: string): string {
  return platformOS === 'ios'
    ? `https://apps.apple.com/app/id${IOS_APP_ID}`
    : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;
}

export function getShareMessage(platformOS: string): string {
  return (
    "I've been exploring and learning with this amazing React Native app! " +
    `Thought you might love it too. Check it out! ${getStoreUrl(platformOS)}`
  );
}

/** Deep link that opens the "write a review" form directly in the store app. */
export function getWriteReviewUrl(platformOS: string): string {
  return platformOS === 'ios'
    ? `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${IOS_APP_ID}?action=write-review`
    : `market://details?id=${ANDROID_PACKAGE_NAME}&showAllReviews=true`;
}

export function getContactUrl(): string {
  const subject = encodeURIComponent('React Native Components Explorer: Feedback');
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
}
