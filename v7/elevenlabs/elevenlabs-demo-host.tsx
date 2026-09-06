import { type ComponentType } from 'react';

import { DemoCredentialGate } from '@/features/demo-credentials/demo-credential-gate';

/**
 * Hosts the official ElevenLabs `examples/react-native-expo` app.
 *
 * The require is deliberately inside the component rather than at module scope.
 * `@elevenlabs/react-native` calls LiveKit's `registerGlobals()` when it is first
 * imported, which installs RTCPeerConnection, MediaStream, and the rest of the
 * WebRTC browser API onto the global object. Importing eagerly would do that to
 * every user of the explorer at app start; this way it happens only once someone
 * opens this demo.
 *
 * The agent ID reaches the vendored `App.tsx` through the credential store's
 * synchronous cache rather than through props — see the adaptation note in
 * `source/official/App.tsx`. The gate resolves the key before rendering its
 * children, so the cache is populated by the time the demo can call startSession.
 */
export function ElevenLabsDemoHost() {
  return (
    <DemoCredentialGate credentialId="elevenlabs">
      {() => {
        const ElevenLabsDemo = require('./source/official/App').default as ComponentType;
        return <ElevenLabsDemo />;
      }}
    </DemoCredentialGate>
  );
}
