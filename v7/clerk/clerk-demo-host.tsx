import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { type ComponentType } from 'react';

import { DemoCredentialGate } from '@/features/demo-credentials/demo-credential-gate';

const ClerkNativeComponentsDemo = require('./source/official/app/index').default as ComponentType;

/**
 * Hosts the untouched official NativeComponentQuickstart screen from
 * clerk/clerk-expo-quickstart.
 *
 * Two things the upstream example does at app scope are done here at demo scope
 * instead, and neither changes the vendored screen:
 *
 *  - Upstream's `app/_layout.tsx` mounts ClerkProvider around the whole app and
 *    reads EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY from the environment, throwing at
 *    module scope if it is absent. Here the provider wraps only this demo, and
 *    the key comes from the credential gate, so the rest of the explorer never
 *    has a Clerk session and a missing key is a prompt rather than a crash.
 *  - `tokenCache` is the same expo-secure-store cache upstream uses. Clerk's own
 *    session tokens are stored under Clerk's keys; the publishable key is stored
 *    separately by the gate.
 */
export function ClerkDemoHost() {
  return (
    <DemoCredentialGate credentialId="clerk">
      {(publishableKey) => (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ClerkNativeComponentsDemo />
        </ClerkProvider>
      )}
    </DemoCredentialGate>
  );
}
