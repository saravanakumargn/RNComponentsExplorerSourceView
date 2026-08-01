import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import { PreferencesContext } from '@/features/paper-example/src/PreferencesContext';

export function PaperExampleProvider({ children }: PropsWithChildren) {
  const theme = MD3LightTheme;

  const preferences = useMemo(
    () => ({
      // The explorer has an app-wide light-only appearance policy.
      toggleTheme: () => undefined,
      toggleRtl: () => undefined,
      toggleThemeVersion: () => undefined,
      toggleCollapsed: () => undefined,
      toggleCustomFont: () => undefined,
      toggleRippleEffect: () => undefined,
      theme,
      rtl: false,
      collapsed: false,
      customFontLoaded: false,
      rippleEffectEnabled: true,
      shouldUseDeviceColors: false,
    }),
    [theme]
  );

  return (
    <PaperProvider theme={theme}>
      <PreferencesContext value={preferences}>
        {children}
      </PreferencesContext>
    </PaperProvider>
  );
}
