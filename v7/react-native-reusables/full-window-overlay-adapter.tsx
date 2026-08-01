import * as React from 'react';

// Reusables only imports FullWindowOverlay from react-native-screens. Its
// nested navigator cannot attach that native overlay to the explorer window,
// so leave the overlay in the active screen's React tree instead.
export function FullWindowOverlay({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
