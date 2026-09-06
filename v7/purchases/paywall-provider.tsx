import { SymbolView } from 'expo-symbols';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_BACKGROUND, NATIVE_COLORS } from '@/components/native-ui/native-tokens';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { trackPremiumEvent } from '@/features/learning/learning-analytics';
import { SupportScreen } from '@/features/more/support-screen';
import { nextPaywallSource } from '@/features/purchases/paywall-state';

/**
 * The paywall, presented as one modal that cannot exist twice.
 *
 * It used to be a stack screen that every locked row pushed. Two presses inside
 * one transition pushed it twice — one back press then revealed a second
 * paywall, which from the reader's seat is a dismiss that did nothing — and a
 * press guard could not close that window because the guard's ref did not
 * survive the list remounting mid-transition (see the Phase A log in
 * docs/learning-roadmap.md).
 *
 * Presence is now a single piece of state instead of a navigation event, so
 * "open the paywall" is idempotent by construction: pressing twice sets the
 * same value twice and there is nothing to stack. No navigation happens at the
 * press at all, which also takes the locked row off the path that sometimes
 * left the reader on the screen behind the list.
 *
 * `/subscription` still exists as a route, because a deep link and the More
 * tab both reach the support screen that way.
 */
type PaywallContextValue = {
  /** Show the paywall. Safe to call repeatedly: a second call while it is open does nothing. */
  openPaywall: (source: string) => void;
};

const PaywallContext = createContext<PaywallContextValue>({ openPaywall: () => {} });

export function usePaywall(): PaywallContextValue {
  return useContext(PaywallContext);
}

export function PaywallProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<string | null>(null);

  const openPaywall = useCallback((requested: string) => {
    setSource((current) => nextPaywallSource(current, requested));
  }, []);

  const closePaywall = useCallback(() => setSource(null), []);

  /**
   * One impression per opening rather than one per press. A double tap used to
   * record two, which overstated the only measurement of how often a lock is
   * actually reached.
   */
  useEffect(() => {
    if (source) trackPremiumEvent(source);
  }, [source]);

  /**
   * A rightward swipe closes it, which is the gesture a pushed screen answered
   * to before this became a modal — including the one Maestro's `back` sends.
   * The vertical fail offset keeps it out of the way of the screen's own
   * scrolling.
   */
  const dismissGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX(24)
        .failOffsetY([-24, 24])
        .onEnd((event) => {
          if (event.translationX > 80) closePaywall();
        }),
    [closePaywall],
  );

  const value = useMemo(() => ({ openPaywall }), [openPaywall]);

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <Modal
        animationType="slide"
        onRequestClose={closePaywall}
        presentationStyle="fullScreen"
        visible={source !== null}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={dismissGesture}>
            <View
              style={{
                backgroundColor: NATIVE_BACKGROUND,
                flex: 1,
                paddingBottom: insets.bottom,
                paddingTop: insets.top,
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  borderBottomColor: NATIVE_COLORS.separator,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  flexDirection: 'row',
                  gap: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                }}
              >
                <NativeText style={{ flex: 1 }} textStyle="headline">
                  Support us
                </NativeText>
                <Pressable
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  hitSlop={12}
                  onPress={closePaywall}
                  style={{ alignItems: 'center', height: 44, justifyContent: 'center', width: 44 }}
                  testID="paywall-close"
                >
                  {/* The system close affordance for a sheet: a filled grey
                      circle, not a bare glyph. */}
                  <View style={{ alignItems: 'center', backgroundColor: NATIVE_COLORS.fill, borderRadius: 15, height: 30, justifyContent: 'center', width: 30 }}>
                    <SymbolView name="xmark" size={13} tintColor={NATIVE_COLORS.secondaryLabel} weight="bold" />
                  </View>
                </Pressable>
              </View>
              <SupportScreen />
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </PaywallContext.Provider>
  );
}
