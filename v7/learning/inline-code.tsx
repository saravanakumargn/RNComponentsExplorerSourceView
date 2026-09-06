import { Text, type TextProps } from 'react-native';

import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_COLORS, NATIVE_TYPE, type NativeTypeStyle } from '@/components/native-ui/native-tokens';
import { toIosTextStyle } from '@/components/native-ui/native-type-mapping';

import { splitInlineCode } from './inline-code-parser';

type InlineCodeTextProps = Omit<TextProps, 'children'> & {
  children: string;
  /** Draws the text in a supporting grey, for a caption or a secondary line. */
  tone?: 'primary' | 'secondary' | 'tertiary';
  /** An iOS text style. Prefer this in new code. */
  textStyle?: NativeTypeStyle;
  /**
   * A Material variant name, mapped to its iOS equivalent.
   *
   * Kept so the ~20 existing call sites did not all have to change in the commit
   * that took `react-native-paper` out of this component. New code should pass
   * `textStyle`.
   */
  variant?: string;
};

/**
 * Renders authored markdown backticks as inline code. Used wherever plain-text
 * content is shown outside the HTML readers — a quiz asking about `window`
 * should not show the reader the backticks.
 *
 * The code span is drawn the way iOS draws one: the system monospace face at
 * the surrounding text's size rather than a fixed 14pt, on a faint fill, so a
 * package name inside a sentence stays on the sentence's baseline instead of
 * shrinking out of it.
 */
export function InlineCodeText({ children, tone = 'primary', textStyle, variant, ...rest }: InlineCodeTextProps) {
  const resolved = textStyle ?? toIosTextStyle(variant);

  return (
    <NativeText selectable textStyle={resolved} tone={tone} {...rest}>
      {splitInlineCode(children).map((segment, index) =>
        segment.code ? (
          <Text
            key={index}
            style={{
              backgroundColor: NATIVE_COLORS.fill,
              fontFamily: 'Menlo',
              // A monospace face at the same point size reads larger than the
              // prose around it, so it is stepped down by one point rather than
              // pinned to a size of its own.
              fontSize: NATIVE_TYPE[resolved].fontSize - 1,
            }}
          >
            {segment.text}
          </Text>
        ) : (
          <Text key={index}>{segment.text}</Text>
        ),
      )}
    </NativeText>
  );
}
