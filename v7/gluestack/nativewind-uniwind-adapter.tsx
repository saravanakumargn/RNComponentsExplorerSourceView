import { useEffect, type ReactNode } from 'react';
import { Uniwind, useUniwind, withUniwind } from 'uniwind';

type StyleMapping = Record<string, string>;

export function styled(Component: any, mapping?: StyleMapping) {
  if (!mapping) return withUniwind(Component as never);

  const options = Object.fromEntries(
    Object.entries(mapping).map(([classNameProp, styleProp]) => [
      styleProp,
      { fromClassName: classNameProp },
    ])
  );

  return withUniwind(Component as never, options as never);
}

export function useColorScheme() {
  const { theme } = useUniwind();

  return {
    colorScheme: theme === 'dark' ? 'dark' : 'light',
    setColorScheme: (colorScheme: 'dark' | 'light') => Uniwind.setTheme(colorScheme),
  };
}

export function VariableContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: Record<string, string>;
}) {
  const { theme } = useUniwind();

  useEffect(() => {
    Uniwind.updateCSSVariables(theme, value);
  }, [theme, value]);

  return children;
}

export const vars = <T,>(value: T) => value;

// Uniwind already handles className for React Native primitives. This hook
// remains for vendored component compatibility.
export function cssInterop() {}
