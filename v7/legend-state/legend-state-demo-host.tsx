import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable } from '@legendapp/state';
import { configureObservablePersistence, persistObservable } from '@legendapp/state/persist';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import { useSelector } from '@legendapp/state/react';
import { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput, useTheme } from 'react-native-paper';

import { useBottomContentPadding } from '@/components/screen-layout';
import { HandWrittenDemoNotice } from '@/features/reference/hand-written-demo-notice';

/**
 * HAND-WRITTEN DEMO — not vendored.
 *
 * Legend-State ships no React Native example: its `examples/` directory upstream
 * contains a single `middleware.ts`. This file was written for this catalog and
 * is marked as such on screen.
 *
 * Verified against `@legendapp/state` 2.1.15, whose API differs substantially
 * from the 3.x line — v2 uses `Memo` / `useSelector` and `persistObservable`,
 * where v3 introduces `use$` and a different persist story. Check the installed
 * major before copying any of this.
 *
 * The point of the demo is the thing Legend-State is actually for: a component
 * that re-renders only when the exact observable it reads changes, rather than
 * when its parent does.
 */

configureObservablePersistence({
  pluginLocal: ObservablePersistAsyncStorage,
  localOptions: { asyncStorage: { AsyncStorage } },
});

const state$ = observable({
  count: 0,
  name: '',
});

persistObservable(state$, { local: 'legend-state-demo' });

/** Counts its own renders so the fine-grained claim is visible, not asserted. */
function RenderCounter({ label }: { label: string }) {
  const renders = useRef(0);
  renders.current += 1;
  const theme = useTheme();

  return (
    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
      {label} rendered {renders.current}×
    </Text>
  );
}

/**
 * Reads `count` and counts its own renders.
 *
 * Observed on device with 2.1.15: tapping Increment changes the number while
 * this component's render count stays at 1. Legend-State updates the value
 * without re-running the component — that is the "no re-renders" claim being
 * literal, not shorthand for "fewer re-renders".
 */
function ReactiveCount() {
  const count = useSelector(state$.count);

  return (
    <>
      <Text variant="displaySmall" testID="legend-state-count">
        {count}
      </Text>
      <RenderCounter label="This component" />
    </>
  );
}

export function LegendStateDemoHost() {
  const theme = useTheme();
  const bottomPadding = useBottomContentPadding(32);
  // Reading through useSelector subscribes this component to `name` only.
  const name = useSelector(state$.name);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
    >
      <HandWrittenDemoNotice
        libraryTitle="Legend-State"
        reason="Legend-State publishes no React Native example app to vendor — its examples/ directory holds a single middleware file."
      />

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            COUNT
          </Text>
          {/* Subscribes to count and re-renders alone when it changes. */}
          <ReactiveCount />
        </Card.Content>
      </Card>

      <View style={styles.row}>
        <Button
          mode="contained-tonal"
          style={styles.flex}
          onPress={() => state$.count.set((c) => c - 1)}
        >
          Decrement
        </Button>
        <Button
          mode="contained"
          style={styles.flex}
          testID="legend-state-increment"
          onPress={() => state$.count.set((c) => c + 1)}
        >
          Increment
        </Button>
      </View>

      <RenderCounter label="Whole screen" />

      <Divider style={styles.divider} />

      <Text variant="titleSmall">Fine-grained rendering</Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Tap Increment and watch the two render counters. Neither one moves. The number changes, but
        the component displaying it is never re-run, and neither is the screen around it. That is
        the claim taken literally: a change to an observable updates what is on screen without a
        React render pass anywhere. Compare it with the field below, which does re-render the
        screen on every keystroke — the same store, read a coarser way.
      </Text>

      <Divider style={styles.divider} />

      <Text variant="titleSmall">Two-way binding</Text>
      <TextInput
        mode="outlined"
        label="Name"
        value={name}
        onChangeText={(v) => state$.name.set(v)}
        autoCapitalize="words"
        testID="legend-state-name"
      />
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        This field reads through `useSelector`, so typing re-renders the screen — the deliberate
        contrast with the Memo above. In real code you would wrap the input, not the screen.
      </Text>

      <Divider style={styles.divider} />

      <Text variant="titleSmall">Persistence</Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        `persistObservable` writes the whole observable to AsyncStorage under `legend-state-demo` on
        every change, with no save call. Change both fields, force-quit, and come back — they are
        restored. Loading is asynchronous, so the first frame shows the initial values.
      </Text>

      <Button
        mode="outlined"
        style={styles.resetButton}
        onPress={() => state$.set({ count: 0, name: '' })}
      >
        Reset observable
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
