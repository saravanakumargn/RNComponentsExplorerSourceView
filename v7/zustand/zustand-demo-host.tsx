import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { HandWrittenDemoNotice } from '@/features/reference/hand-written-demo-notice';
import { useBottomContentPadding } from '@/components/screen-layout';

/**
 * HAND-WRITTEN DEMO — not vendored.
 *
 * zustand ships no React Native example: `examples/demo` and `examples/starter`
 * upstream are Vite/React DOM apps. This file was written for this catalog to
 * show the store API on device, and is marked as such on screen so nobody
 * mistakes it for upstream code.
 *
 * What it demonstrates, in the order the API is usually learned:
 *  1. `create` with state and actions colocated in the store.
 *  2. Selector subscriptions — each reader re-renders only for its own slice.
 *  3. `persist` with AsyncStorage, so counts survive a reload.
 */

type CounterState = {
  count: number;
  step: number;
  increment: () => void;
  decrement: () => void;
  setStep: (step: number) => void;
  reset: () => void;
};

const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      step: 1,
      increment: () => set((s) => ({ count: s.count + s.step })),
      decrement: () => set((s) => ({ count: s.count - s.step })),
      setStep: (step) => set({ step }),
      reset: () => set({ count: 0, step: 1 }),
    }),
    {
      name: 'zustand-demo-counter',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Subscribes to `count` only. Changing the step alone does not re-render this. */
function CountReadout() {
  const count = useCounterStore((s) => s.count);
  const theme = useTheme();

  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          COUNT
        </Text>
        <Text variant="displaySmall" testID="zustand-count">
          {count}
        </Text>
      </Card.Content>
    </Card>
  );
}

/** Subscribes to `step` only, to make the selector boundary visible. */
function StepPicker() {
  const { step, setStep } = useCounterStore(useShallow((s) => ({ step: s.step, setStep: s.setStep })));

  return (
    <SegmentedButtons
      value={String(step)}
      onValueChange={(v) => setStep(Number(v))}
      buttons={[
        { value: '1', label: '+1' },
        { value: '5', label: '+5' },
        { value: '10', label: '+10' },
      ]}
    />
  );
}

export function ZustandDemoHost() {
  const theme = useTheme();
  const bottomPadding = useBottomContentPadding(32);
  // Actions are static references, so pulling them out never causes a re-render.
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
    >
      <HandWrittenDemoNotice
        libraryTitle="Zustand"
        reason="Zustand's upstream examples are Vite web apps, so there is no React Native example to vendor."
      />

      <CountReadout />

      <View style={styles.row}>
        <Button mode="contained-tonal" style={styles.flex} onPress={decrement}>
          Decrement
        </Button>
        <Button mode="contained" style={styles.flex} onPress={increment} testID="zustand-increment">
          Increment
        </Button>
      </View>

      <Text variant="titleSmall">Step size</Text>
      <StepPicker />

      <Divider style={styles.divider} />

      <Text variant="titleSmall">Selector subscriptions</Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        The count and the step picker read the same store through different selectors, so each one
        re-renders only when its own slice changes. This is the difference between Zustand and
        putting the same state in a React context, where every consumer re-renders together.
      </Text>

      <Divider style={styles.divider} />

      <Text variant="titleSmall">Persistence</Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        The store is wrapped in `persist` backed by AsyncStorage under the key
        `zustand-demo-counter`. Change the count, leave this screen, force-quit the app, and come
        back — the value is still here. Rehydration is asynchronous, so the first frame renders the
        initial state and then updates.
      </Text>

      <Button mode="outlined" style={styles.resetButton} onPress={reset}>
        Reset store
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderCurve: 'continuous', borderRadius: 16 },
  cardContent: { alignItems: 'center', gap: 2, paddingVertical: 20 },
  container: { gap: 12, padding: 16 },
  divider: { marginVertical: 4 },
  flex: { flex: 1 },
  resetButton: { alignSelf: 'flex-start', marginTop: 8 },
  row: { flexDirection: 'row', gap: 12 },
});
