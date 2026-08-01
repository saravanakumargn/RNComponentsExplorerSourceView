import * as React from 'react';
import { useModalPortalRoot } from '@rn-primitives/portal';

type PortalProps = {
  children?: React.ReactNode;
};

// The upstream demo uses a global portal store. That store does not deliver
// portals created after an interaction when the demo is embedded in the
// explorer's independent navigation tree. Rendering the portal in place keeps
// the official overlay components in the active screen on iOS and Android.
export function Portal({ children }: PortalProps) {
  return <>{children}</>;
}

export function PortalHost() {
  return null;
}

export { useModalPortalRoot };
