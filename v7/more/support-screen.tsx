import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { NativeButton } from '@/components/native-ui/native-button';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_BACKGROUND, NATIVE_COLORS, NATIVE_TINT } from '@/components/native-ui/native-tokens';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

import { CenteredEmptyState, ScreenLayout } from '@/components/screen-layout';
import { isPurchasesConfigured } from '@/features/purchases/configure-purchases';
import { isUserCancelledError, purchaseErrorMessage } from '@/features/purchases/purchase-errors';
import { isLearningProductId } from '@/features/purchases/purchase-info';
import { getRestoreMessage } from '@/features/purchases/restore-message';
import { useSubscription } from '@/features/purchases/use-subscription';

import { openPrivacy, openTerms } from './more-actions';
import { SupportTierIcon } from './support-tier-icon';
import { DEFAULT_SUPPORT_TIER_ID, SUPPORT_TIERS, type SupportTier } from './support-tiers';

type TierOffer = { tier: SupportTier; pkg: PurchasesPackage };

type LoadState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'error'; message: string }
  | { status: 'ready'; offers: TierOffer[]; learning: PurchasesPackage | null };

const SUPPORT_UNAVAILABLE_MESSAGE = 'Support options are unavailable right now. Please try again later.';

/**
 * What the one-time learning purchase buys, in three lines rather than five.
 *
 * It used to claim quizzes, flashcard review, cheat sheets, and checklists as
 * well. None of those are gated — only the lesson, FAQ, and interview lists
 * are — so the screen was selling things the reader already had. They stay
 * free deliberately: they are what makes the app worth keeping installed, and
 * a free reader sees ads. What the purchase actually opens is the depth.
 *
 * "Offline" rides along with the last line instead of getting its own: the
 * content database ships inside the binary, so every lesson is offline whether
 * or not anything is bought. It is true, but it is not what the purchase buys,
 * and listing it separately padded the screen with a benefit that is already
 * the reader's.
 */
const LEARNING_FEATURES = [
  { icon: 'book.closed.fill', label: 'Every lesson in every track' },
  { icon: 'quote.bubble.fill', label: 'Every interview question, with its follow-ups' },
  { icon: 'wifi.slash', label: 'No ads, and it all works offline' },
] as const;

function errorMessage(error: unknown): string {
  return purchaseErrorMessage(error, SUPPORT_UNAVAILABLE_MESSAGE);
}

export function SupportScreen() {
  const { adsRemoved, isLoading: isSubscriptionLoading, learningUnlocked, refresh, restore } = useSubscription();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const loadOfferings = useCallback(async () => {
    if (!isPurchasesConfigured()) {
      setState({ status: 'unavailable' });
      return;
    }
    setState({ status: 'loading' });
    try {
      const offerings = await Purchases.getOfferings();
      const offers = SUPPORT_TIERS.flatMap((tier) => {
        const pkg = offerings.all[tier.id]?.availablePackages[0];
        return pkg ? [{ tier, pkg }] : [];
      });
      /**
       * Found by product id across every offering rather than by a known
       * offering id: the learning product is `RN_Learning_Premium` on iOS and
       * `rn_learning_premium` on Android, and which offering holds it is a
       * dashboard decision this screen should not depend on.
       */
      const learning = Object.values(offerings.all)
        .flatMap((offering) => offering.availablePackages)
        .find((pkg) => isLearningProductId(pkg.product.identifier)) ?? null;
      if (offers.length === 0 && !learning) {
        setState({ status: 'error', message: SUPPORT_UNAVAILABLE_MESSAGE });
        return;
      }
      setState({ status: 'ready', offers, learning });
      const preferred = offers.find((offer) => offer.tier.id === DEFAULT_SUPPORT_TIER_ID);
      setSelectedId((preferred ?? offers[0]).tier.id);
    } catch (error) {
      setState({ status: 'error', message: errorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void loadOfferings();
  }, [loadOfferings]);

  const onSupport = useCallback(async () => {
    if (state.status !== 'ready') return;
    const selected = state.offers.find((offer) => offer.tier.id === selectedId);
    if (!selected) return;

    setPurchaseError(null);
    setMessage(null);
    setIsPurchasing(true);
    try {
      await Purchases.purchasePackage(selected.pkg);
      await refresh();
      setMessage('Thank you for supporting the app! ❤️');
    } catch (error) {
      if (!isUserCancelledError(error)) setPurchaseError(errorMessage(error));
    } finally {
      setIsPurchasing(false);
    }
  }, [refresh, selectedId, state]);

  const onUnlockLearning = useCallback(async () => {
    if (state.status !== 'ready' || !state.learning) return;
    setPurchaseError(null);
    setMessage(null);
    setIsPurchasing(true);
    try {
      await Purchases.purchasePackage(state.learning);
      await refresh();
      setMessage('Unlocked. The whole library is yours. ❤️');
    } catch (error) {
      if (!isUserCancelledError(error)) setPurchaseError(errorMessage(error));
    } finally {
      setIsPurchasing(false);
    }
  }, [refresh, state]);

  const onRestore = useCallback(async () => {
    setMessage(null);
    setIsRestoring(true);
    try {
      setMessage(getRestoreMessage(await restore()));
    } finally {
      setIsRestoring(false);
    }
  }, [restore]);

  if (isSubscriptionLoading || state.status === 'loading') {
    return (
      <CenteredEmptyState>
        <ActivityIndicator accessibilityLabel="Loading support options" />
      </CenteredEmptyState>
    );
  }

  if (learningUnlocked) {
    return (
      <ScreenLayout testID="maestro-support-ready">
        <View style={{ alignItems: 'center', gap: 12, paddingTop: 24 }}>
          <SymbolView name="checkmark.seal.fill" size={48} tintColor={NATIVE_TINT} />
          <NativeText textStyle="title2">You've unlocked everything ❤️</NativeText>
          <NativeText style={{ textAlign: 'center' }} textStyle="callout" tone="secondary">
            Every lesson, FAQ, and interview question is yours — offline and ad-free. Thanks for supporting the
            app!
          </NativeText>
        </View>
      </ScreenLayout>
    );
  }

  if (state.status === 'unavailable' || state.status === 'error') {
    return (
      <ScreenLayout testID="maestro-support-ready">
        <NativeText textStyle="title2">Support our team ❤️</NativeText>
        <NativeText textStyle="callout" tone="secondary">
          {state.status === 'unavailable'
            ? "In-app purchases aren't configured in this build yet, so the support options can't be shown."
            : state.message}
        </NativeText>
        {state.status === 'error' ? (
          <NativeButton onPress={() => void loadOfferings()} style={{ alignSelf: 'flex-start' }} title="Try again" variant="filled" />
        ) : null}
      </ScreenLayout>
    );
  }

  return (
    <View style={{ backgroundColor: NATIVE_BACKGROUND, flex: 1 }}>
      <ScreenLayout testID="maestro-support-ready">
        <View style={{ gap: 8 }}>
          <NativeText textStyle="title2">Two different things ❤️</NativeText>
          <NativeText selectable textStyle="callout" tone="secondary">
            One unlocks the learning library. The other is a tip that removes ads.
          </NativeText>
        </View>

        {state.learning ? (
          <NativeCard accent={NATIVE_TINT} padding={18} style={{ gap: 12 }} testID="support-learning-offer">
              <NativeText style={{ color: NATIVE_TINT }} textStyle="footnote" weight="600">Unlock the library</NativeText>
              <NativeText textStyle="title2">{state.learning.product.priceString} once</NativeText>
              <View style={{ gap: 10 }}>
                {LEARNING_FEATURES.map((feature) => (
                  <View key={feature.label} style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                    <SymbolView name={feature.icon} size={19} tintColor={NATIVE_TINT} />
                    <NativeText style={{ flex: 1 }} textStyle="callout">{feature.label}</NativeText>
                  </View>
                ))}
              </View>
              <NativeButton
                disabled={isPurchasing}
                onPress={() => void onUnlockLearning()}
                testID="support-unlock-learning"
                title={isPurchasing ? 'Processing…' : 'Unlock everything'}
                variant="filled"
              />
          </NativeCard>
        ) : null}

        {state.offers.length > 0 ? (
        <View style={{ gap: 8, paddingTop: 4 }}>
          <NativeText textStyle="headline">Or just buy us a treat</NativeText>
          {/*
            The most important sentence on this screen. A reader who buys a
            treat expecting the library and does not get it has been misled by
            us, so it is said plainly and before the prices rather than after.
          */}
          <NativeText selectable textStyle="callout">
            A thank-you that removes ads. It does <NativeText textStyle="callout" weight="700">not</NativeText> open the
            learning library, and every tier does the same thing.
          </NativeText>
          {adsRemoved ? (
            <NativeText selectable textStyle="footnote" tone="secondary">
              Ads are already gone on this device — thank you. Another treat is welcome but buys nothing new.
            </NativeText>
          ) : null}
        </View>
        ) : null}

        <View style={{ gap: 10 }}>
          {state.offers.map(({ tier, pkg }) => {
            const selected = selectedId === tier.id;
            return (
              <Pressable
                key={tier.id}
                accessibilityLabel={`${tier.label}, ${pkg.product.priceString}`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setSelectedId(tier.id)}
                style={{ minHeight: 44 }}
              >
                <NativeCard accent={selected ? NATIVE_TINT : undefined}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14 }}>
                    <SupportTierIcon tier={tier} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <NativeText textStyle="headline">{tier.label}</NativeText>
                      <NativeText textStyle="subheadline" tone="secondary">{pkg.product.priceString}</NativeText>
                    </View>
                    <SymbolView
                      name={selected ? 'checkmark.circle.fill' : 'circle'}
                      size={22}
                      tintColor={selected ? NATIVE_TINT : '#C7C7CC'}
                    />
                  </View>
                </NativeCard>
              </Pressable>
            );
          })}
        </View>

        {purchaseError ? (
          <NativeText textStyle="callout" tone="destructive">
            {purchaseError}
          </NativeText>
        ) : null}
        {message ? (
          <NativeText style={{ textAlign: 'center' }} textStyle="callout">
            {message}
          </NativeText>
        ) : null}

        {state.offers.length > 0 ? (
          <NativeButton
            disabled={!selectedId || isPurchasing}
            onPress={() => void onSupport()}
            testID="support-buy-treat"
            title={isPurchasing ? 'Processing…' : 'Buy us a treat'}
            variant={state.learning ? 'tinted' : 'filled'}
          />
        ) : null}

        <NativeText selectable style={{ textAlign: 'center' }} textStyle="footnote" tone="secondary">
          Bought this before? Restore it on this device.
        </NativeText>
        <NativeButton disabled={isRestoring} onPress={() => void onRestore()} title="Restore Purchases" />

        {/* Kept deliberately: a paywall is where App Review expects the terms
            and privacy links, and the consent line that frames them. */}
        <NativeText style={{ textAlign: 'center' }} textStyle="footnote" tone="secondary">
          By continuing you agree to our Terms and Privacy Policy.
        </NativeText>

        <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
          <NativeButton onPress={() => void openTerms()} title="Terms of Service" />
          <NativeButton onPress={() => void openPrivacy()} title="Privacy Policy" />
        </View>
      </ScreenLayout>
    </View>
  );
}
