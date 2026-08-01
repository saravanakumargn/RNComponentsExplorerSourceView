import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { createContext, useContext, type ReactNode } from 'react';

const LinkContext = createContext<string | null>(null);

function toRouteName(href: string) {
  return href.replace(/^\//, '') || 'index';
}

export function useRouter() {
  const navigation = useNavigation();
  return {
    back: () => navigation.goBack(),
    replace: (href: string) => navigation.replace(toRouteName(href) as never),
  };
}

type LinkComponent = ((props: { children: ReactNode; href: string; asChild?: boolean }) => ReactNode) & {
  Trigger: (props: { children: React.ReactElement }) => ReactNode;
  Preview: () => null;
};

export const Link = (({ children, href }) => {
  return <LinkContext.Provider value={href}>{children}</LinkContext.Provider>;
}) as LinkComponent;

Link.Trigger = function LinkTrigger({ children }: { children: React.ReactElement }) {
  const href = useContext(LinkContext);
  const navigation = useNavigation();

  return React.cloneElement(children, {
    onPress: (...args: unknown[]) => {
      children.props.onPress?.(...args);
      if (href) {
        navigation.navigate(toRouteName(href) as never);
      }
    },
  });
};

Link.Preview = function LinkPreview() {
  return null;
};

export { useFocusEffect };
