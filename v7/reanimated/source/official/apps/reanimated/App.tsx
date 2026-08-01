import './types';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { memo } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';

import { BackButton } from '@/components';
import { ViewSourceButton } from '../../../../../source-viewer/view-source-button';
import { createStack, IS_MACOS } from '@/utils';

import { EXAMPLES } from './examples';

const reanimatedExampleSourcePaths = require('./example-source-paths.json') as Record<string, string>;

type RootStackParamList = { [P in keyof typeof EXAMPLES]: undefined } & {
  Home: undefined;
};

interface HomeScreenProps {
  navigation:
    | StackNavigationProp<RootStackParamList, 'Home'>
    | NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const EXAMPLES_NAMES = Object.keys(EXAMPLES);
const platform =
  Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : undefined;

function findExamples(search: string) {
  return EXAMPLES_NAMES.filter((name) => {
    const example = EXAMPLES[name];
    const isUnsupported =
      example.disabledPlatforms?.includes(Platform.OS) ||
      (example.needsBundleMode && !globalThis._WORKLETS_BUNDLE_MODE_ENABLED) ||
      (platform && example.shouldWork?.[platform] === false);

    return (
      !isUnsupported &&
      example.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  });
}

function HomeScreen({ navigation }: HomeScreenProps) {
  const [search, setSearch] = React.useState('');
  const [wasClicked, setWasClicked] = React.useState<string[]>([]);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: (event) => {
          setSearch(event.nativeEvent.text);
        },
        onSearchButtonPress: (event) => {
          const results = findExamples(event.nativeEvent.text);
          if (results.length >= 1) {
            navigation.navigate(results[0]);
          }
        },
      },
      headerTransparent: false,
    });
  }, [navigation]);

  return (
    <FlatList
      data={findExamples(search)}
      initialNumToRender={EXAMPLES_NAMES.length}
      renderItem={({ item: name }) => (
        <Item
          icon={EXAMPLES[name].icon}
          title={EXAMPLES[name].title}
          onPress={() => {
            navigation.navigate(name);
            if (!wasClicked.includes(name)) {
              setTimeout(() => setWasClicked([...wasClicked, name]), 500);
            }
          }}
          shouldWork={platform ? EXAMPLES[name].shouldWork?.[platform] : undefined}
          wasClicked={wasClicked.includes(name)}
        />
      )}
      renderScrollComponent={(props) => <ScrollView {...props} />}
      ItemSeparatorComponent={ItemSeparator}
      style={styles.list}
    />
  );
}

interface ItemProps {
  icon?: string;
  title: string;
  onPress: () => void;
  wasClicked?: boolean;
  shouldWork?: boolean;
}

function Item({
  icon,
  title,
  onPress,
  wasClicked,
  shouldWork,
}: ItemProps) {
  const Button = IS_MACOS ? Pressable : RectButton;
  return (
    <Button
      style={[
        styles.button,
        wasClicked && styles.visitedItem,
      ]}
      onPress={onPress}>
      {icon && <Text style={styles.title}>{icon + '  '}</Text>}
      <Text style={styles.title}>{title}</Text>
      {shouldWork !== undefined && (
        <Text style={styles.shouldWorkEmoji}>{shouldWork ? '✅' : '❌'}</Text>
      )}
    </Button>
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const Stack = createStack<RootStackParamList>();

type AppProps = {
  onExit?: () => void;
};

function screenOptions(onExit: (() => void) | undefined) {
  return ({ route }: { route: { name: string } }) => {
    const sourcePath =
      route.name === 'Examples'
        ? 'features/reanimated/source/official/apps/reanimated/examples/index.ts'
        : reanimatedExampleSourcePaths[route.name];

    return {
    headerLeft: IS_MACOS ? undefined : () => <BackButton onExit={onExit} />,
    headerRight: () => (
      <ViewSourceButton
        demoId="react-native-reanimated"
        iconOnly
        title="React Native Reanimated source"
        initialPath={sourcePath}
        onlyInitialPath={sourcePath !== undefined}
      />
    ),
    };
  };
}

type AnimationType = 'none' | 'default' | 'fade';

function Navigator({ onExit }: AppProps) {
  const shouldReduceMotion = useReducedMotion();
  let animation: AnimationType = 'default';
  if (IS_MACOS) {
    animation = 'none';
  } else if (shouldReduceMotion) {
    animation = 'fade';
  }

  return (
    <Stack.Navigator screenOptions={screenOptions(onExit)}>
      <Stack.Screen
        name="Examples"
        component={HomeScreen}
        options={{
          headerTitle: '🐎 Reanimated examples',
          title: 'Reanimated examples',
          headerStyle: globalThis._WORKLETS_BUNDLE_MODE_ENABLED
            ? { backgroundColor: '#f9f9d9' }
            : undefined,
        }}
      />
      {EXAMPLES_NAMES.map((name) => (
        <Stack.Screen
          key={name}
          name={name}
          component={EXAMPLES[name].screen}
          options={{
            animation: animation,
            headerTitle: EXAMPLES[name].title,
            title: EXAMPLES[name].title,
          }}
        />
      ))}
    </Stack.Navigator>
  );
}

function App({ onExit }: AppProps) {
  return <Navigator onExit={onExit} />;
}

declare global {
  var _WORKLETS_BUNDLE_MODE_ENABLED: boolean | undefined;
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#EFEFF4',
  },
  separator: {
    height: 1,
    backgroundColor: '#DBDBE0',
  },
  button: {
    flex: 1,
    height: 60,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 16,
    color: 'black',
  },
  shouldWorkEmoji: {
    fontSize: 20,
    color: 'black',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  visitedItem: {
    backgroundColor: '#e6f0f7',
  },
});

export default memo(App);
