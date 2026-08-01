import type { ComponentType } from 'react';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';

// The official source is compiled by Metro at runtime. It owns an isolated
// React Navigation tree so it can coexist with the explorer's Expo Router tree.
const SkiaExampleApp = require('./source/official/App').default as ComponentType<{
  onExit: () => void;
}>;

export function SkiaDemoScreen() {
  const router = useRouter();
  const handleExit = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }, [router]);

  return <SkiaExampleApp onExit={handleExit} />;
}
