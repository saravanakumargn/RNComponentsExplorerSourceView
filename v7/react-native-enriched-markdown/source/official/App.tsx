import { NavigationContainer } from '@react-navigation/native';
import { Stack } from './navigation/Stack';
import HomeScreen from './screens/home/HomeScreen';
import PlaygroundScreen from './screens/playground/PlaygroundScreen';
import TextScreen from './screens/text/TextScreen';
import InputScreen from './screens/input/InputScreen';
import StreamingMarkdownSimulator from './screens/streaming/StreamingMarkdownSimulator';
import { DemoBackButton } from '@/components/demo-back-button';
import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

function sourceHeaderRight(initialPath: string, title: string) {
  return () => (
    <ViewSourceButton
      demoId="react-native-enriched-markdown"
      iconOnly
      title={title}
      initialPath={initialPath}
      onlyInitialPath
    />
  );
}

type AppProps = {
  onBackToCatalog?: () => void;
};

export default function App({ onBackToCatalog }: AppProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#BEEBD0',
          },
          headerTintColor: '#001A72',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Enriched Markdown Examples',
            headerLeft: onBackToCatalog
              ? ({ tintColor }) => (
                  <DemoBackButton tintColor={tintColor} onPress={onBackToCatalog} />
                )
              : undefined,
            headerRight: sourceHeaderRight(
              'features/react-native-enriched-markdown/source/official/App.tsx',
              'App.tsx source'
            ),
          }}
        />
        <Stack.Screen
          name="Playground"
          component={PlaygroundScreen}
          options={{
            title: 'Playground',
            headerRight: sourceHeaderRight(
              'features/react-native-enriched-markdown/source/official/screens/playground/PlaygroundScreen.tsx',
              'PlaygroundScreen.tsx source'
            ),
          }}
        />
        <Stack.Screen
          name="Text"
          component={TextScreen}
          options={{
            title: 'Text',
            headerRight: sourceHeaderRight(
              'features/react-native-enriched-markdown/source/official/screens/text/TextScreen.tsx',
              'TextScreen.tsx source'
            ),
          }}
        />
        <Stack.Screen
          name="Input"
          component={InputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Stream"
          component={StreamingMarkdownSimulator}
          options={{
            title: 'Stream',
            headerRight: sourceHeaderRight(
              'features/react-native-enriched-markdown/source/official/screens/streaming/StreamingMarkdownSimulator.tsx',
              'StreamingMarkdownSimulator.tsx source'
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
