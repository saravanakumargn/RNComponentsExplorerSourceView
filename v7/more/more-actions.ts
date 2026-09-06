/**
 * Share / rate / feedback / legal actions for the More tab, ported from the old
 * app (backup_oldcode/src/utils/CommonUtils.ts). URL building lives in
 * ./more-links so it can be unit tested without react-native.
 */
import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

import { openInAppBrowser } from '@/utils/open-in-app-browser';
import { trackAppAction, type AppAction } from '@/features/telemetry/telemetry';

import {
  FEEDBACK_FORM_URL,
  LINKEDIN_PROFILE_URL,
  PRIVACY_URL,
  SHARE_TITLE,
  TERMS_URL,
  UPWORK_PROFILE_URL,
  getContactUrl,
  getShareMessage,
  getStoreUrl,
  getWriteReviewUrl,
} from './more-links';

function logError(action: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`[more] ${action} failed:`, error.message);
  }
}

export async function shareThisApp(): Promise<void> {
  try {
    const result = await Share.share({ message: getShareMessage(Platform.OS), title: SHARE_TITLE });
    if (result.action === Share.sharedAction) trackAppAction('shared');
  } catch (error) {
    logError('shareThisApp', error);
  }
}

export async function openStoreReview(): Promise<void> {
  try {
    await Linking.openURL(getWriteReviewUrl(Platform.OS));
    trackAppAction('review_opened');
  } catch (error) {
    logError('openStoreReview', error);
    // Store deep links are unavailable on simulators and the web build.
    await openInAppBrowser(getStoreUrl(Platform.OS))
      .then(() => trackAppAction('review_opened'))
      .catch((fallbackError) => logError('openStoreReview fallback', fallbackError));
  }
}

export async function submitFeedback(): Promise<void> {
  try {
    await openInAppBrowser(FEEDBACK_FORM_URL);
    trackAppAction('feedback_opened');
  } catch (error) {
    logError('submitFeedback', error);
  }
}

export async function contactSupport(): Promise<void> {
  try {
    await Linking.openURL(getContactUrl());
    trackAppAction('contact_support');
  } catch (error) {
    logError('contactSupport', error);
  }
}

/**
 * Hiring profiles go through `Linking` first so an installed LinkedIn or Upwork
 * app handles the universal link — the visitor is already signed in there, so
 * connecting or sending a message is one tap. The in-app browser is the
 * fallback for devices without the app.
 */
async function openHireProfile(url: string, action: AppAction, label: string): Promise<void> {
  try {
    await Linking.openURL(url);
    trackAppAction(action);
  } catch (error) {
    logError(label, error);
    await openInAppBrowser(url)
      .then(() => trackAppAction(action))
      .catch((fallbackError) => logError(`${label} fallback`, fallbackError));
  }
}

export async function openLinkedInProfile(): Promise<void> {
  await openHireProfile(LINKEDIN_PROFILE_URL, 'hire_linkedin_opened', 'openLinkedInProfile');
}

export async function openUpworkProfile(): Promise<void> {
  await openHireProfile(UPWORK_PROFILE_URL, 'hire_upwork_opened', 'openUpworkProfile');
}

export async function openTerms(): Promise<void> {
  try {
    await openInAppBrowser(TERMS_URL);
    trackAppAction('terms_opened');
  } catch (error) {
    logError('openTerms', error);
  }
}

export async function openPrivacy(): Promise<void> {
  try {
    await openInAppBrowser(PRIVACY_URL);
    trackAppAction('privacy_opened');
  } catch (error) {
    logError('openPrivacy', error);
  }
}
