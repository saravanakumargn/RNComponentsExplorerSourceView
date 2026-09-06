import { useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { NativeButton } from '@/components/native-ui/native-button';
import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_COLORS } from '@/components/native-ui/native-tokens';
import type { GlossaryTerm } from '@/features/learning/data/learning-types';
import { InlineCodeText } from '@/features/learning/inline-code';

/** Renders a short definition's authored backticks as inline code. */
export function GlossaryDefinition({ definition }: { definition: string }) {
  return <InlineCodeText>{definition}</InlineCodeText>;
}

/**
 * The inline half of the glossary: a term tapped mid-lesson answers itself
 * without losing the reader's place. The full entry stays one tap further on,
 * for when the short definition is not enough.
 *
 * Presented with React Native's `Modal` rather than Paper's `Portal` and
 * `Modal`. Paper's pair needs `PaperProvider` in the tree, which is still at the
 * root for the demo catalogue, but a reader on a Learning screen should not be
 * drawing a Material surface with a Material scrim — and `Portal` renders
 * outside the screen's own hierarchy, which is a second thing to reason about
 * for no benefit here.
 *
 * The scrim is `accessible={false}` on purpose: `Pressable` defaults it to true,
 * and an accessibility element collapses everything inside it into one node, so
 * an accessible scrim would hide the term, the definition and both buttons from
 * VoiceOver and from Maestro alike. It is the same trap the reset dialog hit.
 */
export function GlossaryPopover({ term, onDismiss }: { term: GlossaryTerm | null; onDismiss: () => void }) {
  const router = useRouter();

  if (!term) return null;

  return (
    <Modal animationType="fade" onRequestClose={onDismiss} transparent visible>
      <Pressable accessible={false} onPress={onDismiss} style={styles.scrim}>
        <Pressable accessible={false} onPress={() => undefined} style={styles.card}>
          <View testID="glossary-popover-ready" style={{ gap: 10 }}>
            <NativeText textStyle="footnote" tone="secondary" weight="600">
              Glossary
            </NativeText>
            <NativeText textStyle="title2">{term.term}</NativeText>
            <GlossaryDefinition definition={term.shortDefinition} />
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <NativeButton onPress={onDismiss} title="Close" />
              {/* Routed imperatively rather than through `Link asChild`:
                  `NativeButton` is already the pressable, and `asChild` would
                  have to clone it to pass the press down. Dismissing first keeps
                  the popover from sitting over the entry it just opened. */}
              <NativeButton
                onPress={() => {
                  onDismiss();
                  router.push({ pathname: '/glossary/[termId]', params: { termId: term.termId } });
                }}
                testID="glossary-popover-open-entry"
                title="Full entry"
                variant="tinted"
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: NATIVE_COLORS.card,
    borderCurve: 'continuous',
    borderRadius: 20,
    maxWidth: 380,
    padding: 20,
    width: '90%',
  },
  scrim: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.32)', flex: 1, justifyContent: 'center' },
});
