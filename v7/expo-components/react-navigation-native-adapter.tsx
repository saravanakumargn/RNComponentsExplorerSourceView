import {
  NavigationContainer as UpstreamNavigationContainer,
} from '@react-navigation/native';

export * from '@react-navigation/native';

/**
 * Integration-only wrapper used while the vendored Expo source resolves
 * @react-navigation/native. The surrounding Expo Router header stays hidden,
 * so this navigator owns all visible headers and transitions.
 */
export function NavigationContainer(
  props: React.ComponentProps<typeof UpstreamNavigationContainer>
) {
  return <UpstreamNavigationContainer {...props} />;
}
