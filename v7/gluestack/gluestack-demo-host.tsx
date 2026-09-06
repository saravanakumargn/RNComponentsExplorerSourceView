import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderBackButton } from '@react-navigation/elements';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ScopedTheme } from 'uniwind';

import { nestedDemoInitialState } from '@/components/nested-demo-deep-link';
import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

type ScreenDefinition = {
  name: string;
  title: string;
  component: ComponentType;
  sourcePath: string;
};

const Stack = createNativeStackNavigator();
const AppThemeProvider = require('./source/official/contexts/app-theme-context')
  .AppThemeProvider as ComponentType<{ children: React.ReactNode }>;
const useAppTheme = require('./source/official/contexts/app-theme-context')
  .useAppTheme as () => { colorMode: 'dark' | 'light' };
const GluestackUIProvider = require('./source/official/components/ui/gluestack-ui-provider')
  .GluestackUIProvider as ComponentType<{
  children: React.ReactNode;
  mode: 'dark' | 'light';
}>;
const customFonts = require('./source/official/app/fonts').customFonts;

const componentScreens: ScreenDefinition[] = [
  ['accordion', 'Accordion'], ['actionsheet', 'Actionsheet'], ['alert-dialog', 'Alert Dialog'],
  ['alert', 'Alert'], ['avatar', 'Avatar'], ['badge', 'Badge'], ['bottomsheet', 'Bottom Sheet'],
  ['box', 'Box'], ['button', 'Button'], ['calendar', 'Calendar'], ['card', 'Card'],
  ['center', 'Center'], ['chat-ai', 'Chat AI'], ['checkbox', 'Checkbox'],
  ['date-time-picker', 'Date Time Picker'], ['divider', 'Divider'], ['drawer', 'Drawer'],
  ['fab', 'Fab'], ['form-control', 'Form Control'], ['grid', 'Grid'], ['heading', 'Heading'],
  ['hstack', 'HStack'], ['icon', 'Icon'], ['image-viewer', 'Image Viewer'], ['image', 'Image'],
  ['input', 'Input'], ['link', 'Link'], ['liquid-glass', 'Liquid Glass'], ['menu', 'Menu'],
  ['modal', 'Modal'], ['popover', 'Popover'], ['portal', 'Portal'], ['pressable', 'Pressable'],
  ['progress', 'Progress'], ['radio', 'Radio'], ['select', 'Select'], ['skeleton', 'Skeleton'],
  ['slider', 'Slider'], ['spinner', 'Spinner'], ['switch', 'Switch'], ['table', 'Table'],
  ['tabs', 'Tabs'], ['text', 'Text'], ['textarea', 'Textarea'], ['toast', 'Toast'],
  ['tooltip', 'Tooltip'], ['vstack', 'VStack'],
].map(([name, title]) => ({
  name: `components/${name}`,
  title,
  component: componentFor(name),
  sourcePath: `features/gluestack/source/official/app/(home)/components/${name}.tsx`,
}));

function componentFor(name: string): ComponentType {
  const components: Record<string, ComponentType> = {
    accordion: require('./source/official/app/(home)/components/accordion').default,
    actionsheet: require('./source/official/app/(home)/components/actionsheet').default,
    'alert-dialog': require('./source/official/app/(home)/components/alert-dialog').default,
    alert: require('./source/official/app/(home)/components/alert').default,
    avatar: require('./source/official/app/(home)/components/avatar').default,
    badge: require('./source/official/app/(home)/components/badge').default,
    bottomsheet: require('./source/official/app/(home)/components/bottomsheet').default,
    box: require('./source/official/app/(home)/components/box').default,
    button: require('./source/official/app/(home)/components/button').default,
    calendar: require('./source/official/app/(home)/components/calendar').default,
    card: require('./source/official/app/(home)/components/card').default,
    center: require('./source/official/app/(home)/components/center').default,
    'chat-ai': require('./source/official/app/(home)/components/chat-ai').default,
    checkbox: require('./source/official/app/(home)/components/checkbox').default,
    'date-time-picker': require('./source/official/app/(home)/components/date-time-picker').default,
    divider: require('./source/official/app/(home)/components/divider').default,
    drawer: require('./source/official/app/(home)/components/drawer').default,
    fab: require('./source/official/app/(home)/components/fab').default,
    'form-control': require('./source/official/app/(home)/components/form-control').default,
    grid: require('./source/official/app/(home)/components/grid').default,
    heading: require('./source/official/app/(home)/components/heading').default,
    hstack: require('./source/official/app/(home)/components/hstack').default,
    icon: require('./source/official/app/(home)/components/icon').default,
    'image-viewer': require('./source/official/app/(home)/components/image-viewer').default,
    image: require('./source/official/app/(home)/components/image').default,
    input: require('./source/official/app/(home)/components/input').default,
    link: require('./source/official/app/(home)/components/link').default,
    'liquid-glass': require('./source/official/app/(home)/components/liquid-glass').default,
    menu: require('./source/official/app/(home)/components/menu').default,
    modal: require('./source/official/app/(home)/components/modal').default,
    popover: require('./source/official/app/(home)/components/popover').default,
    portal: require('./source/official/app/(home)/components/portal').default,
    pressable: require('./source/official/app/(home)/components/pressable').default,
    progress: require('./source/official/app/(home)/components/progress').default,
    radio: require('./source/official/app/(home)/components/radio').default,
    select: require('./source/official/app/(home)/components/select').default,
    skeleton: require('./source/official/app/(home)/components/skeleton').default,
    slider: require('./source/official/app/(home)/components/slider').default,
    spinner: require('./source/official/app/(home)/components/spinner').default,
    switch: require('./source/official/app/(home)/components/switch').default,
    table: require('./source/official/app/(home)/components/table').default,
    tabs: require('./source/official/app/(home)/components/tabs').default,
    text: require('./source/official/app/(home)/components/text').default,
    textarea: require('./source/official/app/(home)/components/textarea').default,
    toast: require('./source/official/app/(home)/components/toast').default,
    tooltip: require('./source/official/app/(home)/components/tooltip').default,
    vstack: require('./source/official/app/(home)/components/vstack').default,
  };

  return components[name]!;
}

const showcaseScreens: ScreenDefinition[] = [
  {
    name: 'showcases/showcase-1', title: 'Showcase 1',
    component: require('./source/official/app/(home)/showcases/showcase-1').default,
    sourcePath: 'features/gluestack/source/official/app/(home)/showcases/showcase-1/index.tsx',
  },
  {
    name: 'showcases/showcase-2', title: 'Showcase 2',
    component: require('./source/official/app/(home)/showcases/showcase-2').default,
    sourcePath: 'features/gluestack/source/official/app/(home)/showcases/showcase-2/index.tsx',
  },
  {
    name: 'showcases/showcase-3', title: 'Showcase 3',
    component: require('./source/official/app/(home)/showcases/showcase-3').default,
    sourcePath: 'features/gluestack/source/official/app/(home)/showcases/showcase-3/index.tsx',
  },
];

const ShowcasesTab = require('./source/official/app/(home)/_tabs/showcases-tab')
  .default as ComponentType<{ onShowcaseNavigate?: (path: string) => void }>;
const ComponentsTab = require('./source/official/app/(home)/_tabs/components-tab')
  .default as ComponentType<{ onComponentNavigate?: (path: string) => void }>;

const demoRouteNames = [...componentScreens, ...showcaseScreens].map((screen) => screen.name);

function DemoNavigator({ initialDemo, onBackToCatalog }: { initialDemo?: string; onBackToCatalog: () => void }) {
  const { colorMode } = useAppTheme();
  const initialState = nestedDemoInitialState('components', initialDemo, demoRouteNames);

  // The explorer compiles every Tailwind demo through one Uniwind entry
  // (styles/explorer.css), where each demo's palette is registered as a theme.
  // HeroUI and Gluestack share variable names such as `--background`, so the
  // active theme decides which palette a screen gets. Scoping it to this
  // subtree keeps Gluestack's colors out of the rest of the app.
  return (
    <ScopedTheme
      theme={colorMode === 'dark' ? 'gluestack-dark' : 'gluestack-light'}
    >
      <GluestackUIProvider mode={colorMode}>
        <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
        <NavigationIndependentTree>
          <NavigationContainer initialState={initialState}>
            <Stack.Navigator initialRouteName="components">
              <Stack.Screen
                name="components"
                options={{
                  title: 'Gluestack UI',
                  headerLeft: () => <HeaderBackButton onPress={onBackToCatalog} />,
                  headerRight: () => (
                    <ViewSourceButton
                      demoId="gluestack-ui"
                      iconOnly
                      title="Gluestack UI source"
                      initialPath="features/gluestack/source/official/app/(home)/_tabs/components-tab.tsx"
                      onlyInitialPath
                    />
                  ),
                }}
              >
                {({ navigation }) => (
                  <ComponentsTab
                    onComponentNavigate={(path) => navigation.navigate(`components/${path}` as never)}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="showcases"
                options={{
                  title: 'Gluestack UI showcases',
                  headerRight: () => (
                    <ViewSourceButton
                      demoId="gluestack-ui"
                      iconOnly
                      title="Gluestack UI source"
                      initialPath="features/gluestack/source/official/app/(home)/_tabs/showcases-tab.tsx"
                      onlyInitialPath
                    />
                  ),
                }}
              >
                {({ navigation }) => (
                  <ShowcasesTab
                    onShowcaseNavigate={(path) => navigation.navigate(`showcases/${path}` as never)}
                  />
                )}
              </Stack.Screen>
              {[...componentScreens, ...showcaseScreens].map((screen) => (
                <Stack.Screen
                  key={screen.name}
                  name={screen.name}
                  component={screen.component}
                  options={{
                    title: screen.title,
                    headerRight: () => (
                      <ViewSourceButton
                        demoId="gluestack-ui"
                        iconOnly
                        title="Gluestack UI source"
                        initialPath={screen.sourcePath}
                        onlyInitialPath
                      />
                    ),
                  }}
                />
              ))}
            </Stack.Navigator>
          </NavigationContainer>
        </NavigationIndependentTree>
      </GluestackUIProvider>
    </ScopedTheme>
  );
}

export function GluestackDemoHost({
  initialDemo,
  onBackToCatalog,
}: {
  initialDemo?: string;
  onBackToCatalog: () => void;
}) {
  const [fontsLoaded] = useFonts(customFonts);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <DemoNavigator initialDemo={initialDemo} onBackToCatalog={onBackToCatalog} />
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
