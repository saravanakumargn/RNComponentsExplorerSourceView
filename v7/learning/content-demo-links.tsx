import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_COLORS, NATIVE_TINT } from '@/components/native-ui/native-tokens';
import type { ContentDemo } from '@/features/learning/data/learning-types';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';

/**
 * One tappable chip that opens a demo in Components & API. Shared by the reader
 * bar below and by the decision guides, which attach a demo to a single
 * recommended option rather than to the record as a whole.
 *
 * Drawn as a tinted capsule rather than an outlined card: it is an action, it
 * sits in a horizontal row of its siblings, and iOS gives that shape to a
 * tinted button. The 44pt hit target is kept even though the capsule is
 * shorter than that.
 */
export function ContentDemoLink({ demo, testID }: { demo: ContentDemo; testID: string }) {
  return (
    <Link href={{ pathname: '/library/[library]', params: { library: demo.demoId } }} asChild>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={getLearningNavigationAccessibility({ title: demo.label, destination: 'demo' })}
        accessibilityHint="Opens the demo in Components and API"
        style={({ pressed }) => ({ justifyContent: 'center', minHeight: 44, opacity: pressed ? 0.55 : 1 })}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: `${NATIVE_TINT}14`,
            borderCurve: 'continuous',
            borderRadius: 10,
            flexDirection: 'row',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <SymbolView name="play.circle.fill" size={17} tintColor={NATIVE_TINT} />
          <NativeText style={{ color: NATIVE_TINT }} textStyle="subheadline" weight="600">
            {demo.label}
          </NativeText>
        </View>
      </Pressable>
    </Link>
  );
}

/**
 * The bridge from a lesson to the running demo it describes — the thing this
 * app has that a book does not.
 *
 * Rendered as a bar under the reader rather than inside it: the reader is a
 * WebView, and a link inside that document would have to be posted back out
 * through the message channel and cannot show it is a native destination.
 */
export function ContentDemoLinks({ demos }: { demos: ContentDemo[] }) {
  if (demos.length === 0) return null;
  return (
    <View
      testID="content-demo-links"
      style={{ borderTopColor: NATIVE_COLORS.separator, borderTopWidth: 1, gap: 8, paddingBottom: 4, paddingTop: 10 }}
    >
      <NativeText style={{ paddingHorizontal: 12 }} textStyle="footnote" tone="secondary" weight="600">
        Try it in the app
      </NativeText>
      <ScrollView
        horizontal
        contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}
        showsHorizontalScrollIndicator={false}
      >
        {demos.map((demo, index) => (
          <ContentDemoLink key={demo.demoId} demo={demo} testID={`content-demo-${index}`} />
        ))}
      </ScrollView>
    </View>
  );
}
