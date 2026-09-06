/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {
  ComponentList,
  ExamplesList,
  RNTesterModuleInfo,
  RNTesterNavigationState,
  SectionData,
} from '../types/RNTesterTypes';

import RNTesterList from './RNTesterList';

export const Screens = {
  COMPONENTS: 'components',
  APIS: 'apis',
} as const;

export const initialNavigationState: RNTesterNavigationState = {
  activeModuleKey: null,
  activeModuleTitle: null,
  activeModuleExampleKey: null,
  screen: Screens.COMPONENTS,
  recentlyUsed: {components: [], apis: []},
  hadDeepLink: false,
};

/**
 * Host integration: opens one module directly for `?demo=<module key>`.
 *
 * The section matters as well as the key — the bottom nav bar reads `screen`,
 * so seeding an API module while `screen` still says "components" would open the
 * right example under the wrong tab. An unknown key falls back to the list.
 */
export function getInitialNavigationState(
  activeModuleKey: ?string,
): RNTesterNavigationState {
  if (activeModuleKey == null) {
    return initialNavigationState;
  }

  const api = RNTesterList.APIs.find(module => module.key === activeModuleKey);
  const component = RNTesterList.Components.find(
    module => module.key === activeModuleKey,
  );
  const match = api ?? component;

  if (match == null) {
    return initialNavigationState;
  }

  return {
    ...initialNavigationState,
    activeModuleKey,
    activeModuleTitle: match.module.title,
    screen: api != null ? Screens.APIS : Screens.COMPONENTS,
  };
}

const filterEmptySections = (examplesList: ExamplesList): any => {
  const filteredSections: {
    ['apis' | 'components']: Array<SectionData<RNTesterModuleInfo>>,
  } = {};
  const sectionKeys = Object.keys(examplesList);

  sectionKeys.forEach(key => {
    filteredSections[key] = examplesList[key].filter(
      section => section.data.length > 0,
    );
  });

  return filteredSections;
};

export const getExamplesListWithRecentlyUsed = ({
  recentlyUsed,
  testList,
}: {
  recentlyUsed: ComponentList,
  testList?: {
    components?: Array<RNTesterModuleInfo>,
    apis?: Array<RNTesterModuleInfo>,
  },
}): ExamplesList | null => {
  // Return early if state has not been initialized from storage
  if (!recentlyUsed) {
    return null;
  }

  const componentList = testList?.components ?? RNTesterList.Components;
  const components = componentList.map(
    (componentExample): RNTesterModuleInfo => ({
      ...componentExample,
      exampleType: Screens.COMPONENTS,
    }),
  );

  const recentlyUsedComponents = recentlyUsed.components
    .map(recentComponentKey =>
      components.find(component => component.key === recentComponentKey),
    )
    .filter(Boolean);

  const apisList = testList?.apis ?? RNTesterList.APIs;
  const apis = apisList.map((apiExample): RNTesterModuleInfo => ({
    ...apiExample,
    exampleType: Screens.APIS,
  }));

  const recentlyUsedAPIs = recentlyUsed.apis
    .map(recentAPIKey =>
      apis.find(apiExample => apiExample.key === recentAPIKey),
    )
    .filter(Boolean);

  const examplesList: ExamplesList = {
    [Screens.COMPONENTS]: [
      {
        key: 'RECENT_COMPONENTS',
        data: recentlyUsedComponents,
        title: 'Recently Viewed',
      },
      {
        key: 'COMPONENTS',
        data: components.sort((a, b) =>
          a.module.title.localeCompare(b.module.title),
        ),
        title: 'Components',
      },
    ],
    [Screens.APIS]: [
      {
        key: 'RECENT_APIS',
        data: recentlyUsedAPIs,
        title: 'Recently viewed',
      },
      {
        key: 'APIS',
        data: apis.sort((a, b) => a.module.title.localeCompare(b.module.title)),
        title: 'APIs',
      },
    ],
  };

  return filterEmptySections(examplesList);
};
