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
      replace: (href: string) => navigation.replace(toRouteName(href) as never),
    }),
    [navigation]
  );
}

export function usePathname() {
  const route = useRoute();
  return route.name === 'components' ? '/(home)/components' : `/(home)/${route.name}`;
}

export { useFocusEffect };
