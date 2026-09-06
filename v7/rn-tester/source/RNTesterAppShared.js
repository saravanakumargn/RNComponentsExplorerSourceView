/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {RNTesterModuleInfo, ScreenTypes} from './types/RNTesterTypes';

import RNTesterModuleContainer from './components/RNTesterModuleContainer';
import RNTesterModuleList from './components/RNTesterModuleList';
import RNTesterNavBar, {navBarHeight} from './components/RNTesterNavbar';
import {RNTesterThemeContext, themes} from './components/RNTesterTheme';
import RNTTitleBar from './components/RNTTitleBar';
import {ViewSourceButton} from '../../source-viewer/view-source-button';
import moduleSourcePaths from './module-source-paths.json';
import RNTesterList from './utils/RNTesterList';
import {
  RNTesterNavigationActionsType,
  RNTesterNavigationReducer,
} from './utils/RNTesterNavigationReducer';
import {
  Screens,
  getExamplesListWithRecentlyUsed,
  getInitialNavigationState,
} from './utils/testerStateUtils';
import * as React from 'react';
import {useCallback, useEffect, useMemo, useReducer} from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';

// RNTester App currently uses in memory storage for storing navigation state

type BackButton = ({onBack: () => void}) => React.Node;
type ExitHandler = () => void;

const RNTesterApp = ({
  testList,
  customBackButton,
  initialDemo,
  onExit,
}: {
  testList?: {
    components?: Array<RNTesterModuleInfo>,
    apis?: Array<RNTesterModuleInfo>,
  },
  customBackButton?: BackButton,
  // Host integration: `?demo=<module key>` opens one example directly, for the
  // route smoke suite. RNTester navigates by reducer state rather than by route,
  // so the deep link seeds that state instead of a navigator.
  initialDemo?: ?string,
  onExit?: ExitHandler,
}): React.Node => {
  const [state, dispatch] = useReducer(
    RNTesterNavigationReducer,
    getInitialNavigationState(initialDemo),
  );
  const colorScheme = useColorScheme();

  const {
    activeModuleKey,
    activeModuleTitle,
    activeModuleExampleKey,
    screen,
    recentlyUsed,
    hadDeepLink,
  } = state;

  const isScreenTiny = useWindowDimensions().height < 600;

  const examplesList = useMemo(
    () => getExamplesListWithRecentlyUsed({recentlyUsed, testList}),
    [recentlyUsed, testList],
  );

  const handleBackPress = useCallback(() => {
    if (activeModuleKey != null) {
      dispatch({type: RNTesterNavigationActionsType.BACK_BUTTON_PRESS});
    }
  }, [dispatch, activeModuleKey]);

  // Setup hardware back button press listener
  useEffect(() => {
    const handleHardwareBackPress = () => {
      if (activeModuleKey) {
        handleBackPress();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress,
    );
    return () => subscription.remove();
  }, [activeModuleKey, handleBackPress]);

  const handleModuleCardPress = useCallback(
    ({exampleType, key, title}: any) => {
      dispatch({
        type: RNTesterNavigationActionsType.MODULE_CARD_PRESS,
        data: {exampleType, key, title},
      });
    },
    [dispatch],
  );

  const handleModuleExampleCardPress = useCallback(
    (exampleName: string) => {
      dispatch({
        type: RNTesterNavigationActionsType.EXAMPLE_CARD_PRESS,
        data: {key: exampleName},
      });
    },
    [dispatch],
  );

  const handleNavBarPress = useCallback(
    (args: {screen: ScreenTypes}) => {
      dispatch({
        type: RNTesterNavigationActionsType.NAVBAR_PRESS,
        data: {screen: args.screen},
      });
    },
    [dispatch],
  );

  // Setup Linking event subscription
  const handleOpenUrlRequest = useCallback(
    ({url}: {url: string, ...}) => {
      // Supported URL pattern(s):
      // *  rntester://example/<moduleKey>
      // *  rntester://example/<moduleKey>/<exampleKey>
      const match =
        /^rntester(-legacy)?:\/\/example\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?$/.exec(
          url,
        );
      if (!match) {
        console.warn(
          `handleOpenUrlRequest: Received unsupported URL: '${url}'`,
        );
        return;
      }

      const rawModuleKey = match[2];
      const exampleKey = match[3];

      // For tooling compatibility, allow all these variants for each module key:
      const validModuleKeys = [
        rawModuleKey,
        `${rawModuleKey}Index`,
        `${rawModuleKey}Example`,
        // $FlowFixMe[invalid-computed-prop]
      ].filter(k => RNTesterList.Modules[k] != null);
      if (validModuleKeys.length !== 1) {
        if (validModuleKeys.length === 0) {
          console.error(
            `handleOpenUrlRequest: Unable to find requested module with key: '${rawModuleKey}'`,
          );
        } else {
          console.error(
            `handleOpenUrlRequest: Found multiple matching module with key: '${rawModuleKey}', unable to resolve`,
          );
        }
        return;
      }

      const resolvedModuleKey = validModuleKeys[0];
      // $FlowFixMe[invalid-computed-prop]
      const exampleModule = RNTesterList.Modules[resolvedModuleKey];

      if (exampleKey != null) {
        const validExampleKeys = exampleModule.examples.filter(
          e => e.name === exampleKey,
        );
        if (validExampleKeys.length !== 1) {
          if (validExampleKeys.length === 0) {
            console.error(
              `handleOpenUrlRequest: Unable to find requested example with key: '${exampleKey}' within module: '${resolvedModuleKey}'`,
            );
          } else {
            console.error(
              `handleOpenUrlRequest: Found multiple matching example with key: '${exampleKey}' within module: '${resolvedModuleKey}', unable to resolve`,
            );
          }
          return;
        }
      }

      console.log(
        `handleOpenUrlRequest: Opening module: '${resolvedModuleKey}', example: '${
          exampleKey || 'null'
        }'`,
      );

      dispatch({
        type: RNTesterNavigationActionsType.EXAMPLE_OPEN_URL_REQUEST,
        data: {
          key: resolvedModuleKey,
          title: exampleModule.title || resolvedModuleKey,
          exampleKey,
        },
      });
    },
    [dispatch],
  );
  useEffect(() => {
    // Initial deeplink
    Linking.getInitialURL()
      .then(url => url != null && handleOpenUrlRequest({url: url}))
      .catch(_ => {});
    const subscription = Linking.addEventListener('url', handleOpenUrlRequest);
    return () => subscription.remove();
  }, [handleOpenUrlRequest]);

  const theme = colorScheme === 'dark' ? themes.dark : themes.light;

  if (examplesList === null) {
    return null;
  }

  const activeModule =
    // $FlowFixMe[invalid-computed-prop]
    activeModuleKey != null ? RNTesterList.Modules[activeModuleKey] : null;
  const activeModuleExample =
    activeModuleExampleKey != null
      ? activeModule?.examples.find(e => e.name === activeModuleExampleKey)
      : null;
  const title =
    activeModuleTitle != null
      ? activeModuleTitle
      : screen === Screens.COMPONENTS
        ? 'Components'
        : 'APIs';

  const BackButtonComponent: ?BackButton = customBackButton ?? null;

  const activeExampleList =
    screen === Screens.COMPONENTS ? examplesList.components : examplesList.apis;
  const sourcePath =
    activeModuleKey != null
      ? moduleSourcePaths[activeModuleKey]
      : 'features/rn-tester/source/utils/RNTesterList.ios.js';

  // Hide chrome if we don't have much screen space and are showing UI for tests
  const shouldHideChrome = isScreenTiny && hadDeepLink;

  return (
    <RNTesterThemeContext.Provider value={theme}>
      {Platform.OS === 'android' ? (
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.GroupedBackgroundColor}
        />
      ) : null}
      {!shouldHideChrome && (
        <RNTTitleBar
          title={title}
          theme={theme}
          documentationURL={activeModule?.documentationURL}
          onBack={activeModule ? handleBackPress : undefined}
          onExit={onExit}
          rightChildren={
            <ViewSourceButton
              demoId="react-native"
              iconOnly
              title="React Native source"
              initialPath={sourcePath}
              onlyInitialPath={sourcePath != null}
            />
          }>
          {activeModule && BackButtonComponent ? (
            <BackButtonComponent onBack={handleBackPress} />
          ) : undefined}
        </RNTTitleBar>
      )}
      <View
        style={StyleSheet.compose(styles.container, {
          backgroundColor: theme.GroupedBackgroundColor,
        })}>
        {activeModule != null ? (
          // Host integration: readiness marker for the route smoke suite.
          <View
            style={styles.container}
            testID={`maestro-demo-react-native-${activeModuleKey}-ready`}>
            <RNTesterModuleContainer
              module={activeModule}
              example={activeModuleExample}
              onExampleCardPress={handleModuleExampleCardPress}
            />
          </View>
        ) : (
          <RNTesterModuleList
            sections={activeExampleList}
            handleModuleCardPress={handleModuleCardPress}
          />
        )}
      </View>
      {!shouldHideChrome && (
        <View style={styles.bottomNavbar}>
          <RNTesterNavBar
            screen={screen || Screens.COMPONENTS}
            isExamplePageOpen={!!activeModule}
            handleNavBarPress={handleNavBarPress}
          />
        </View>
      )}
    </RNTesterThemeContext.Provider>
  );
};

export default RNTesterApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavbar: {
    height: navBarHeight,
  },
  hidden: {
    display: 'none',
  },
});
