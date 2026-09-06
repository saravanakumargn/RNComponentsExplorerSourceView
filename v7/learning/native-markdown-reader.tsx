import { ScrollView } from 'react-native';
import { EnrichedMarkdownText, type MarkdownStyle } from 'react-native-enriched-markdown';

import { isLessonEndReached } from './learning-lesson-reader-utils';

type NativeMarkdownReaderProps = { markdown: string; onEndReached?: () => void; onLinkPress?: ({ url }: { url: string }) => void };

/**
 * The house style for every rendered learning document, exported so a screen
 * that supplies its own scrolling — a sheet, where a nested scroll view would
 * fight the sheet's own gesture — still reads identically to a full lesson.
 */
export const learningMarkdownStyle: MarkdownStyle = {
  paragraph: { color: '#1C1B1F', fontSize: 18, lineHeight: 29, marginBottom: 16 },
  h1: { color: '#1C1B1F', fontSize: 30, fontWeight: '700', marginBottom: 14, marginTop: 20 },
  h2: { color: '#1C1B1F', fontSize: 26, fontWeight: '700', marginBottom: 12, marginTop: 28 },
  h3: { color: '#1C1B1F', fontSize: 21, fontWeight: '700', marginBottom: 10, marginTop: 22 },
  code: { backgroundColor: '#F3F3F3', color: '#444444', fontFamily: 'Menlo', fontSize: 16 },
  codeBlock: { backgroundColor: '#1E1E1E', borderRadius: 10, color: '#F3F4F6', fontFamily: 'Menlo', fontSize: 14, padding: 14, syntaxColors: { comment: '#8B949E', constant: '#79C0FF', function: '#D2A8FF', keyword: '#FF7B72', number: '#79C0FF', property: '#79C0FF', string: '#A5D6FF', type: '#FFA657', variable: '#FFA657' } },
  table: { borderColor: '#D0D5DD', borderRadius: 8, cellPaddingHorizontal: 12, cellPaddingVertical: 10, fontSize: 15, headerBackgroundColor: '#F3F4F6', headerFontFamily: 'System-Bold' },
  list: { fontSize: 18, gapWidth: 8, itemSpacing: 8, lineHeight: 29, marginBottom: 16, markerColor: '#005AC1' },
  link: { color: '#005AC1', underline: true },
};

/** Shared fully native renderer for every long-form learning document. */
export function NativeMarkdownReader({ markdown, onEndReached, onLinkPress }: NativeMarkdownReaderProps) {
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingBottom: 32 }} onScroll={({ nativeEvent }) => { if (onEndReached && isLessonEndReached({ contentOffsetY: nativeEvent.contentOffset.y, viewportHeight: nativeEvent.layoutMeasurement.height, contentHeight: nativeEvent.contentSize.height })) onEndReached(); }} scrollEventThrottle={100} style={{ flex: 1 }}><EnrichedMarkdownText flavor="github" markdown={markdown} markdownStyle={learningMarkdownStyle} onLinkPress={onLinkPress} selectable /></ScrollView>;
}
