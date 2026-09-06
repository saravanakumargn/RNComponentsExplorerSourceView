import type { ComponentType } from 'react';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';

// RNTester is official Flow source, which Metro compiles at runtime. Metro
// resolves its platform-safe registry in the config below.
const RNTesterApp = require('./source/RNTesterAppShared').default as ComponentType<{
  initialDemo?: string;
  onExit: () => void;
}>;

export function RNTesterDemoScreen({ initialDemo }: { initialDemo?: string }) {
  const router = useRouter();
  const handleExit = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }, [router]);

  return (
    <RNTesterApp initialDemo={initialDemo} onExit={handleExit} />
  );
}
