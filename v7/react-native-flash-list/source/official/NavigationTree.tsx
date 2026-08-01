import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { HeaderBackButton } from "@react-navigation/elements";

// Host integration: lets the root screen exit back to the surrounding catalog
// and open the shared source viewer. Neither is part of the upstream fixture app.
import { goBackToCatalog } from "../../catalog-navigation-bridge";
import { ViewSourceButton } from "../../../source-viewer/view-source-button";

import Reminders from "./Reminders";
import List from "./List";
import PaginatedList from "./PaginatedList";
import ContactsSectionList from "./contacts/ContactsSectionList";
import Contacts from "./contacts/Contacts";
import { RootStackParamList } from "./constants";
import { ExamplesScreen } from "./ExamplesScreen";
import { DebugScreen } from "./Debug";
import { Masonry } from "./Masonry";
import { SectionList } from "./SectionList";
import { Grid } from "./Grid";
import { DynamicColumnSpan } from "./DynamicColumnSpan";
import HorizontalList from "./HorizontalList";
import { Chat } from "./Chat";
import { HeaderFooterExample } from "./HeaderFooterExample";
import DynamicItems from "./DynamicItems";
import RecyclerViewHandlerTest from "./RecyclerViewHandlerTest";
import MovieList from "./MovieList";
import Carousel from "./Carousel";
import { LayoutOptions } from "./LayoutOptions";
import ShowcaseApp from "./ShowcaseApp";

const Stack = createStackNavigator<RootStackParamList>();

const NavigationTree = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: "none" }}>
        <Stack.Group>
          <Stack.Screen
            name="Examples"
            component={ExamplesScreen}
            options={{
              headerLeft: () => <HeaderBackButton onPress={goBackToCatalog} />,
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/ExamplesScreen.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="List"
            component={List}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/List.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="Grid"
            component={Grid}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/Grid.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="DynamicColumnSpan"
            component={DynamicColumnSpan}
            options={{
              title: "Dynamic Column Span",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/DynamicColumnSpan.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="SectionList"
            component={SectionList}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/SectionList.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="PaginatedList"
            component={PaginatedList}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/PaginatedList.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="Reminders"
            component={Reminders}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/Reminders.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="Contacts"
            component={Contacts}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/contacts/Contacts.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="ContactsSectionList"
            component={ContactsSectionList}
            options={{
              title: "Contacts",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/contacts/ContactsSectionList.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="DynamicItems"
            component={DynamicItems}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/DynamicItems.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/Chat.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="HeaderFooterExample"
            component={HeaderFooterExample}
            options={{
              title: "Header Footer Empty Example",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/HeaderFooterExample.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="RecyclerViewHandlerTest"
            component={RecyclerViewHandlerTest}
            options={{
              title: "RecyclerView Handler Test",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/RecyclerViewHandlerTest.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="MovieList"
            component={MovieList}
            options={{
              title: "Movie Streaming",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/MovieList.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="Carousel"
            component={Carousel}
            options={{
              title: "Carousel Example",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/Carousel.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="LayoutOptions"
            component={LayoutOptions}
            options={{
              title: "Layout Options",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/LayoutOptions.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
          <Stack.Screen
            name="ShowcaseApp"
            component={ShowcaseApp}
            options={{
              title: "Showcase App",
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/ShowcaseApp.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
        </Stack.Group>
        <Stack.Screen
          name="Masonry"
          component={Masonry}
          options={{
            headerRight: () => (
              <ViewSourceButton
                demoId="flash-list"
                title="Source"
                initialPath="features/react-native-flash-list/source/official/Masonry.tsx"
                onlyInitialPath
              />
            ),
          }}
        />
        <Stack.Screen
          name="HorizontalList"
          component={HorizontalList}
          options={{
            headerRight: () => (
              <ViewSourceButton
                demoId="flash-list"
                title="Source"
                initialPath="features/react-native-flash-list/source/official/HorizontalList.tsx"
                onlyInitialPath
              />
            ),
          }}
        />
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen
            name="Debug"
            component={DebugScreen}
            options={{
              headerRight: () => (
                <ViewSourceButton
                  demoId="flash-list"
                  title="Source"
                  initialPath="features/react-native-flash-list/source/official/Debug/DebugScreen.tsx"
                  onlyInitialPath
                />
              ),
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationTree;
