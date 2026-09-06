import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo } from 'react';

function toRouteName(href: string) {
  const pathname = href.replace(/^\/(?:\(home\)\/)?/, '').replace(/\/$/, '');
  return pathname || 'components';
}

export function useRouter() {
  const navigation = useNavigation();

  return useMemo(
    () => ({
      back: () => navigation.goBack(),
      push: (href: string) => navigation.navigate(toRouteName(href) as never),
      // `replace` exists on the stack navigator this demo is hosted in, but not
      // on the generic NavigationProp that useNavigation() infers here.
      replace: (href: string) =>
        (navigation as unknown as { replace: (name: string) => void }).replace(
          toRouteName(href)
        ),
    }),
    [navigation]
  );
}

export function usePathname() {
  const route = useRoute();
  return route.name === 'components' ? '/(home)/components' : `/(home)/${route.name}`;
}

export { useFocusEffect };
