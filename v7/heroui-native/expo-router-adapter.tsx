import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

type Router = {
  back: () => void;
  push: (href: string) => void;
};

const RouterContext = createContext<Router | null>(null);
const SlotContext = createContext<ReactNode>(null);

function toRouteName(href: string) {
  const pathname = href.replace(/^\/(?:\(home\)\/)?/, '').replace(/\/$/, '');
  return pathname || 'home';
}

export function HeroUINativeRouterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = useNavigation();
  const router = useMemo<Router>(
    () => ({
      back: () => navigation.goBack(),
      push: (href) => navigation.navigate(toRouteName(href) as never),
    }),
    [navigation]
  );

  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}

export function HeroUINativeSlotProvider({
  children,
  slot,
}: {
  children: ReactNode;
  slot: ReactNode;
}) {
  return <SlotContext.Provider value={slot}>{children}</SlotContext.Provider>;
}

export function Slot() {
  return useContext(SlotContext);
}

export function useRouter() {
  const router = useContext(RouterContext);

  if (!router) {
    throw new Error(
      'HeroUI Native routes must be rendered inside the local router adapter.'
    );
  }

  return router;
}

export function usePathname() {
  const route = useRoute();
  return route.name === 'home' ? '/' : `/${route.name}`;
}

export { useFocusEffect };
