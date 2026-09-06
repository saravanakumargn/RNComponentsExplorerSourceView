import { Button, HStack, Host, Image, Text, TextField, VStack } from '@expo/ui/swift-ui';
import {
  autocorrectionDisabled,
  background,
  cornerRadius,
  disabled,
  font,
  foregroundStyle,
  frame,
  multilineTextAlignment,
  padding,
  submitLabel,
  textFieldStyle,
  textInputAutocapitalization,
} from '@expo/ui/swift-ui/modifiers';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, StyleSheet } from 'react-native';

import { NATIVE_TINT } from '@/components/native-ui/native-tokens';
import type { LearningResetSummary } from '@/features/learning/data/learning-types';
import { describeLearningReset, LEARNING_RESET_CONFIRMATION, matchesLearningResetConfirmation } from '@/features/learning/learning-reset';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;

/** The grouped-list background, so the card reads as a system alert. */
const CARD = '#F2F2F7';

/**
 * The typed confirmation, kept in its own component with its own state.
 *
 * Held on the More screen, every keystroke re-rendered the gradient hero, all
 * four grouped sections and every row with it — enough work per character that
 * the field dropped and reordered what was typed. A dialog that re-renders only
 * itself types at the speed of the keyboard.
 *
 * It is mounted only while it is open, so each attempt starts from an empty box
 * rather than the last one's half-typed word.
 *
 * **`TextField` is deliberately left to manage its own text — do not pass
 * `text`.** That prop takes an `ObservableState` from `useNativeState`, which
 * is the `react-native-worklets` path this app cannot load in a Debug build,
 * and it also recreates the bug this dialog was built around: two copies of the
 * same string, React's always a render behind. Type fast enough — which
 * Maestro's `inputText` does — and a character that lands in between is
 * overwritten when the committed value is written back. "RESET" arrived as
 * "REET", the match failed, and the confirm button sat inert with nothing on
 * screen explaining why. With `text` omitted the field owns its text natively
 * and `onTextChange` only observes, which is both the fix and the
 * worklets-free path.
 *
 * The presentation is React Native's `Modal` because SwiftUI's own `Alert`
 * takes only a title, message and buttons, so it cannot hold a field. Every
 * control inside the card is `@expo/ui`.
 */
export function ResetProgressDialog({ isResetting, onCancel, onConfirm, summary }: { isResetting: boolean; onCancel: () => void; onConfirm: () => void; summary: LearningResetSummary }) {
  const [confirmation, setConfirmation] = useState('');
  const keyboardHeight = useKeyboardHeight();
  const armed = matchesLearningResetConfirmation(confirmation);

  const confirm = useCallback(() => { if (armed && !isResetting) onConfirm(); }, [armed, isResetting, onConfirm]);
  const dismiss = useCallback(() => { if (!isResetting) onCancel(); }, [isResetting, onCancel]);

  return (
    <Modal animationType="fade" onRequestClose={dismiss} transparent visible>
      {/* Tapping the scrim cancels, matching the dismissable dialog this replaced.
          Both this and the card below are `accessible={false}`, and that is
          load-bearing rather than tidiness: `Pressable` defaults `accessible` to
          true, an accessibility element collapses everything inside it into one
          node, and a SwiftUI `Host` inside one therefore exposes none of its own
          views. The whole dialog arrived in the tree as a single element labelled
          "RESET" — the field's placeholder — so VoiceOver could not read the
          summary and Maestro could not see the text, the input or either button.
          Neither wrapper is a thing a reader needs to reach: the scrim is a
          shortcut for the Cancel button that is right there, and the card is a
          container. */}
      <Pressable accessible={false} onPress={dismiss} style={styles.scrim}>
        {/* Lifted clear of the keyboard. A dialog that asks the reader to type
            has to keep both the box and the button they are typing towards on
            screen — on a small phone the default centring puts the actions, and
            then the field itself, behind the keys. */}
        <Pressable
          accessible={false}
          onPress={() => undefined}
          style={[styles.card, keyboardHeight > 0 ? { marginBottom: keyboardHeight + 12 } : null]}
          testID="more-reset-dialog"
        >
          {/* `matchContents` is deliberately vertical-only. With both axes on,
              the host takes its *width* from the SwiftUI content too, and
              content asked for its natural width — one unwrapped line per
              string — so the card ran off the right edge of the screen with
              the title, the summary and the destructive button all clipped
              mid-word. Height is the axis that has to follow content, because
              the summary sentence grows with what there is to delete; width is
              the card's to dictate. */}
          <Host
            colorScheme="light"
            matchContents={{ horizontal: false, vertical: true }}
            seedColor={NATIVE_TINT}
            style={styles.host}
          >
            <VStack
              modifiers={[padding({ all: 20 }), background(CARD), cornerRadius(14)]}
              spacing={14}
            >
              <Image color="#FF3B30" size={30} systemName="exclamationmark.triangle.fill" />
              <Text modifiers={[font({ textStyle: 'headline' })]}>Reset learning progress?</Text>
              <Text
                modifiers={[
                  font({ textStyle: 'footnote' }),
                  foregroundStyle(SECONDARY),
                  multilineTextAlignment('center'),
                ]}
              >
                {describeLearningReset(summary)}
              </Text>
              <TextField
                modifiers={[
                  textFieldStyle('roundedBorder'),
                  // Left alone rather than forced to capitals: rewriting each
                  // character is the write-back that cost this box a word, and
                  // the match ignores case anyway.
                  textInputAutocapitalization('never'),
                  autocorrectionDisabled(true),
                  submitLabel('done'),
                  disabled(isResetting),
                ]}
                onTextChange={setConfirmation}
                placeholder={LEARNING_RESET_CONFIRMATION}
                testID="more-reset-confirm-input"
              />
              <HStack modifiers={[frame({ height: 44 })]} spacing={12}>
                <Button
                  label="Cancel"
                  modifiers={[disabled(isResetting)]}
                  onPress={dismiss}
                  role="cancel"
                />
                <Button
                  label={isResetting ? 'Resetting…' : 'Reset everything'}
                  modifiers={[disabled(!armed || isResetting)]}
                  onPress={confirm}
                  role="destructive"
                  testID="more-reset-confirm"
                />
              </HStack>
            </VStack>
          </Host>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: { maxWidth: 320, width: '86%' },
  host: { width: '100%' },
  scrim: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.32)', flex: 1, justifyContent: 'center' },
});

/**
 * How much of the screen the keyboard is covering, or zero when it is down.
 *
 * Measured with `will` events on iOS so the dialog travels with the keyboard
 * rather than jumping after it lands. Only listens while the dialog that needs
 * it is mounted.
 */
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const shown = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (event) => setHeight(event.endCoordinates.height));
    const hidden = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setHeight(0));
    return () => { shown.remove(); hidden.remove(); };
  }, []);

  return height;
}
