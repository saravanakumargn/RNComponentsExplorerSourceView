/**
 * EXPLORER ADAPTATION — this file replaces upstream's `example/src/SupportModal.tsx`.
 *
 * Upstream's version is a real in-app-purchase flow built on `react-native-iap`:
 * it lists three "support the maintainer" tiers, runs a live StoreKit / Play
 * Billing purchase, and records the tier in AsyncStorage. That is a donation
 * mechanism for the library's author, not a haptics demo.
 *
 * It is stubbed here for two reasons:
 *  - `react-native-iap` is a substantial native dependency this app does not
 *    otherwise need, and adding it purely to render a donate button would put a
 *    second purchase system next to the RevenueCat demo's StoreKit config.
 *  - Presenting someone else's purchase UI inside this catalog would invite a
 *    real payment for something the explorer neither provides nor supports.
 *
 * The exported API is kept identical — default component, `SupportTier`,
 * `SUPPORT_STORAGE_KEY`, `higherTier` — so `App.tsx` is vendored **unmodified**.
 * The stub renders an explanatory sheet instead of a purchase flow and never
 * changes the tier. To see the real thing, read upstream's file:
 * https://github.com/mkuczera/react-native-haptic-feedback/blob/main/example/src/SupportModal.tsx
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type SupportTier = 'support_0' | 'support_1' | 'support_2' | null;
export const SUPPORT_STORAGE_KEY = '@haptic_supporter_tier';

const TIER_RANK: Record<string, number> = {
  support_0: 1,
  support_1: 2,
  support_2: 3,
};

/** Unchanged from upstream — pure, no purchase involvement. */
export function higherTier(a: SupportTier, b: SupportTier): SupportTier {
  const ra = a ? TIER_RANK[a] : 0;
  const rb = b ? TIER_RANK[b] : 0;
  return ra >= rb ? a : b;
}

type SupportModalProps = {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  currentTier: SupportTier;
  onTierChange: (tier: SupportTier) => void;
};

export default function SupportModal({ visible, onClose, isDark }: SupportModalProps) {
  const fg = isDark ? '#F8FAFC' : '#0F172A';
  const muted = isDark ? '#CBD5E1' : '#64748B';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.title, { color: fg }]}>Not part of this demo</Text>
          <Text style={[styles.body, { color: muted }]}>
            Upstream&apos;s example puts an in-app purchase here, so you can tip the library&apos;s
            author. This catalog stubs it out: it would mean shipping a second payment system and
            charging you inside a demo app.
          </Text>
          <Text style={[styles.body, { color: muted }]}>
            Everything else on this screen is the real, unmodified example. If you want to support
            the library, do it from its GitHub page.
          </Text>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Back to the demo</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#00000080', flex: 1, justifyContent: 'flex-end' },
  body: { fontSize: 15, lineHeight: 21 },
  button: {
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
    padding: 24,
    paddingBottom: 40,
  },
  title: { fontSize: 20, fontWeight: '700' },
});
