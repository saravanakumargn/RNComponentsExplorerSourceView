type ComponentLayout = {
  name?: string;
  passProps?: Record<string, unknown>;
  options?: {
    topBar?: {
      title?: {
        text?: string;
      };
    };
  };
};

type DemoNavigationAdapter = {
  dismissModal: () => void;
  pop: () => void;
  push: (component: ComponentLayout, presentation?: 'modal') => void;
};

let adapter: DemoNavigationAdapter | undefined;

function getComponent(layout: { component?: ComponentLayout; stack?: { children?: Array<{ component?: ComponentLayout }> } }) {
  return layout.component ?? layout.stack?.children?.[0]?.component;
}

// The official demo imports this module as `react-native-navigation`. The
// Metro resolver maps that import only for vendored RNUI files; this bridge
// preserves their component source while the explorer supplies navigation.
export const Navigation = {
  dismissAllModals: () => adapter?.dismissModal(),
  dismissModal: () => adapter?.dismissModal(),
  events: () => ({
    bindComponent: () => undefined,
    registerAppLaunchedListener: () => undefined,
  }),
  mergeOptions: () => undefined,
  pop: () => adapter?.pop(),
  push: (_componentId: string, layout: { component?: ComponentLayout }) => {
    const component = getComponent(layout);

    if (component) adapter?.push(component);
  },
  registerComponent: () => undefined,
  setDefaultOptions: () => undefined,
  setRoot: () => undefined,
  showModal: (layout: { stack?: { children?: Array<{ component?: ComponentLayout }> } }) => {
    const component = getComponent(layout);

    if (component) adapter?.push(component, 'modal');
  },
};

export function setReactNativeUiLibNavigationAdapter(nextAdapter?: DemoNavigationAdapter) {
  adapter = nextAdapter;
}
