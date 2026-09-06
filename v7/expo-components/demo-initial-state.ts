import { Screens as apiScreens } from './source/official/native-component-list/src/navigation/ExpoApisStackNavigator';
import { Screens as componentScreens } from './source/official/native-component-list/src/navigation/ExpoComponentsStackNavigator';

/**
 * Builds the nested navigation state that opens one Expo Components screen
 * directly, for `/library/expo-components?demo=<screen>`.
 *
 * This library is the one place the flat `nestedDemoInitialState` helper does not
 * fit: its screens sit three navigators deep (a root stack -> a tab navigator ->
 * one of two per-section stacks), so the seeded state has to nest to match. The
 * section is derived from which stack actually registers the screen rather than
 * passed in, so a link only needs the screen name.
 *
 * React Navigation rehydrates a partial state, so naming just the focused tab is
 * enough — it fills in the sibling tab itself.
 */
export function expoComponentsInitialState(demo: string | undefined) {
  if (!demo) return undefined;

  const section = apiScreens.some((screen) => screen.name === demo)
    ? { tab: 'apis', root: 'ExpoApis' }
    : componentScreens.some((screen) => screen.name === demo)
      ? { tab: 'components', root: 'ExpoComponents' }
      : undefined;

  if (!section) return undefined;

  return {
    index: 0,
    routes: [
      {
        name: 'main',
        state: {
          index: 0,
          routes: [
            {
              name: section.tab,
              state: {
                index: 1,
                routes: [{ name: section.root }, { name: demo }],
              },
            },
          ],
        },
      },
    ],
  };
}

/** Every screen name a `?demo=` link may address, for the flow generator's use. */
export function expoComponentsScreenNames() {
  return [...apiScreens, ...componentScreens].map((screen) => screen.name);
}
