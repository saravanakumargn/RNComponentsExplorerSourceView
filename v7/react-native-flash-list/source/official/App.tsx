/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import "react-native-gesture-handler";
import React from "react";

import { DebugContextProvider } from "./Debug";
import NavigationTree from "./NavigationTree";

const App = ({ initialDemo }: { initialDemo?: string }) => {
  return (
    <DebugContextProvider>
      <NavigationTree initialDemo={initialDemo} />
    </DebugContextProvider>
  );
};

export default App;
