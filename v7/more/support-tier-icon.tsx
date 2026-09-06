import { Image } from 'expo-image';

import { NativeText } from '@/components/native-ui/native-text';

import type { SupportTier } from './support-tiers';

/** Artwork per tier id. Tiers missing here fall back to the tier's emoji. */
const TIER_IMAGES: Record<string, number> = {
  support_burgermeal: require('@/assets/images/support/burger.png'),
  support_cupofcoffee: require('@/assets/images/support/coffee-cup.png'),
};

export function SupportTierIcon({ size = 36, tier }: { size?: number; tier: SupportTier }) {
  const image = TIER_IMAGES[tier.id];

  if (image) {
    return (
      <Image
        accessibilityLabel={tier.label}
        contentFit="contain"
        source={image}
        style={{ height: size, width: size }}
      />
    );
  }

  return (
    <NativeText
      accessibilityLabel={tier.label}
      style={{ fontSize: size * 0.8, lineHeight: size, textAlign: 'center', width: size }}
    >
      {tier.emoji}
    </NativeText>
  );
}
