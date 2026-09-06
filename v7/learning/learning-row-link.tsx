import { Link, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable } from 'react-native';

import { usePaywall } from '@/features/purchases/paywall-provider';

type LearningRowLinkProps = PropsWithChildren<{
  accessibilityHint: string;
  accessibilityLabel: string;
  /** Where an unlocked row goes. `null` marks the row locked: it opens the paywall instead. */
  href: Href | null;
  /** The paywall impression a locked row records, once per opening. */
  paywallSource: string;
  testID: string;
}>;

/**
 * One row of a lesson, FAQ, or interview list, unlocked or locked.
 *
 * A locked row does not navigate. It opens the single paywall modal
 * (`PaywallProvider`), which is what stops two presses inside one transition
 * from stacking two paywalls. It also keeps the press doing exactly one thing:
 * the analytics call and the navigation used to sit on the same press, on a
 * `Link` and its child, and composing them was one of the fixes that did not
 * hold.
 */
export function LearningRowLink({
  accessibilityHint,
  accessibilityLabel,
  children,
  href,
  paywallSource,
  testID,
}: LearningRowLinkProps) {
  const { openPaywall } = usePaywall();

  const row = (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={href ? undefined : paywallSource ? () => openPaywall(paywallSource) : undefined}
      style={{ minHeight: 44 }}
      testID={testID}
    >
      {children}
    </Pressable>
  );

  return href ? (
    <Link asChild href={href}>
      {row}
    </Link>
  ) : (
    row
  );
}
