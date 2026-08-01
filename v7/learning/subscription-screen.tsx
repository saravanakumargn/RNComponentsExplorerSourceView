import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Purchases, { PACKAGE_TYPE, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import { ActivityIndicator, Button, Card, Text, useTheme } from 'react-native-paper';

import { CenteredEmptyState, ScreenLayout } from '@/components/screen-layout';
import { isPurchasesConfigured } from '@/features/purchases/configure-purchases';
import { useSubscription } from '@/features/purchases/use-subscription';
import { openInAppBrowser } from '@/utils/open-in-app-browser';

// Same URLs the old app's paywall linked to (backup_oldcode/src/utils/CommonUtils.ts).
const TERMS_URL = 'https://saravanakumargn.github.io/js-learning-app/terms-and-conditions.html';
const PRIVACY_URL = 'https://saravanakumargn.github.io/js-learning-app/privacy-policy.html';

const FEATURES = [
  { icon: 'menu-book', label: 'Unlimited React Native learning content' },
  { icon: 'cloud-off', label: 'Offline learning, anytime' },
  { icon: 'block', label: 'Ad-free, distraction-free learning' },
] as const;

type LoadState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'error'; message: string }
  | { status: 'ready'; offering: PurchasesOffering };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function packageLabel(pkg: PurchasesPackage): string {
  switch (pkg.packageType) {
    case PACKAGE_TYPE.LIFETIME:
      return 'Lifetime access';
    case PACKAGE_TYPE.ANNUAL:
      return 'Annual';
    case PACKAGE_TYPE.SIX_MONTH:
      return '6 months';
    case PACKAGE_TYPE.THREE_MONTH:
      return '3 months';
    case PACKAGE_TYPE.TWO_MONTH:
      return '2 months';
    case PACKAGE_TYPE.MONTHLY:
      return 'Monthly';
    case PACKAGE_TYPE.WEEKLY:
      return 'Weekly';
    default:
      return pkg.product.title || pkg.identifier;
  }
}

export function SubscriptionScreen() {
  const theme = useTheme();
  const { isLoading: isSubscriptionLoading, isSubscribed, refresh, restore } = useSubscription();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | undefined>();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const loadOfferings = useCallback(async () => {
    if (!isPurchasesConfigured()) {
      setState({ status: 'unavailable' });
      return;
    }
    setState({ status: 'loading' });
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current || current.availablePackages.length === 0) {
        setState({ status: 'error', message: 'No subscription plans are available right now.' });
        return;
      }
      setState({ status: 'ready', offering: current });
      setSelectedPackage(
        current.availablePackages.find((pkg) => pkg.packageType === PACKAGE_TYPE.LIFETIME) ??
          current.availablePackages[0],
      );
    } catch (error) {
      setState({ status: 'error', message: errorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void loadOfferings();
  }, [loadOfferings]);

  const onPurchase = useCallback(async () => {
    if (!selectedPackage) return;
    setPurchaseError(null);
    setIsPurchasing(true);
    try {
      await Purchases.purchasePackage(selectedPackage);
      await refresh();
    } catch (error) {
      const cancelled =
        typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled === true;
      if (!cancelled) setPurchaseError(errorMessage(error));
    } finally {
      setIsPurchasing(false);
    }
  }, [refresh, selectedPackage]);

  const onRestore = useCallback(async () => {
    setRestoreMessage(null);
    setIsRestoring(true);
    try {
      const restored = await restore();
      setRestoreMessage(restored ? 'Your subscription was restored.' : 'No active subscription was found to restore.');
    } finally {
      setIsRestoring(false);
    }
  }, [restore]);

  if (isSubscriptionLoading || state.status === 'loading') {
    return (
      <CenteredEmptyState>
        <ActivityIndicator accessibilityLabel="Loading subscription options" />
      </CenteredEmptyState>
    );
  }

  if (isSubscribed) {
    return (
      <ScreenLayout>
        <View style={{ alignItems: 'center', gap: 12, paddingTop: 24 }}>
          <MaterialIcons accessible={false} color={theme.colors.primary} name="check-circle" size={48} />
          <Text variant="headlineSmall">You're subscribed</Text>
          <Text style={{ textAlign: 'center' }} variant="bodyMedium">
            Every lesson, FAQ, and interview question is unlocked. Thanks for supporting the app!
          </Text>
        </View>
        <Link asChild href="/learning-path">
          <Button mode="contained">Back to Learning Path</Button>
        </Link>
      </ScreenLayout>
    );
  }

  if (state.status === 'unavailable') {
    return (
      <ScreenLayout>
        <Text variant="headlineSmall">Unlock all learning content</Text>
        <Text variant="bodyMedium">
          Subscriptions aren't configured in this build yet. The locked-content journey is preserved for when
          RevenueCat is set up.
        </Text>
        <Link asChild href="/learning-path">
          <Button mode="contained">Back to Learning Path</Button>
        </Link>
      </ScreenLayout>
    );
  }

  if (state.status === 'error') {
    return (
      <ScreenLayout>
        <Text variant="headlineSmall">Unlock all learning content</Text>
        <Text variant="bodyMedium">{state.message}</Text>
        <Button mode="contained" onPress={() => void loadOfferings()}>
          Try again
        </Button>
        <Link asChild href="/learning-path">
          <Button mode="text">Back to Learning Path</Button>
        </Link>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={{ gap: 6 }}>
        <Text variant="headlineSmall">Unlock everything</Text>
        <Text variant="bodyMedium">
          Get unlimited access to every lesson, FAQ, and interview question — offline and ad-free.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {FEATURES.map((feature) => (
          <View key={feature.label} style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
            <MaterialIcons accessible={false} color={theme.colors.primary} name={feature.icon} size={20} />
            <Text style={{ flex: 1 }} variant="bodyMedium">
              {feature.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 10 }}>
        {state.offering.availablePackages.map((pkg) => {
          const selected = selectedPackage?.identifier === pkg.identifier;
          return (
            <Pressable
              key={pkg.identifier}
              accessibilityLabel={`${packageLabel(pkg)}, ${pkg.product.priceString}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setSelectedPackage(pkg)}
              style={{ minHeight: 44 }}
            >
              <Card
                mode="outlined"
                style={{
                  borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
                  borderCurve: 'continuous',
                  borderWidth: selected ? 2 : 1,
                }}
              >
                <Card.Content
                  style={{ alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 14 }}
                >
                  <MaterialIcons
                    accessible={false}
                    color={selected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                    name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={22}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{packageLabel(pkg)}</Text>
                  </View>
                  <Text variant="titleMedium">{pkg.product.priceString}</Text>
                </Card.Content>
              </Card>
            </Pressable>
          );
        })}
      </View>

      {purchaseError ? (
        <Text style={{ color: theme.colors.error }} variant="bodyMedium">
          {purchaseError}
        </Text>
      ) : null}

      <Button
        disabled={!selectedPackage || isPurchasing}
        loading={isPurchasing}
        mode="contained"
        onPress={() => void onPurchase()}
      >
        {isPurchasing ? 'Processing…' : 'Unlock Everything'}
      </Button>

      <View style={{ alignItems: 'center', gap: 4 }}>
        <Button disabled={isRestoring} loading={isRestoring} mode="text" onPress={() => void onRestore()}>
          Restore Purchases
        </Button>
        {restoreMessage ? (
          <Text style={{ textAlign: 'center' }} variant="bodySmall">
            {restoreMessage}
          </Text>
        ) : null}
      </View>

      <Text style={{ textAlign: 'center' }} variant="bodySmall">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
      <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
        <Button compact mode="text" onPress={() => void openInAppBrowser(TERMS_URL)}>
          Terms of Service
        </Button>
        <Button compact mode="text" onPress={() => void openInAppBrowser(PRIVACY_URL)}>
          Privacy Policy
        </Button>
      </View>
    </ScreenLayout>
  );
}
