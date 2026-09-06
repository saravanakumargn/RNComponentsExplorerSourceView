// This module binds the name `Symbol`, which shadows the JavaScript global of
// the same name. The React Compiler emits `Symbol.for("react.memo_cache_sentinel")`
// for its memo cache and assumes that identifier is the global, so in a compiled
// build the generated code calls `.for()` on this module's component instead and
// throws `undefined is not a function` — crashing the screen on open. `use no
// memo` is the compiler's documented opt-out (registered by babel-preset-expo)
// and is the smallest change that keeps upstream's naming intact.
"use no memo";

import {
  Canvas,
  Fill,
  Group,
  useClock,
  useFont,
} from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { CRT } from "./CRT";
import { COLS, ROWS, Symbol } from "./Symbol";
import { BG } from "./Theme";

const rows = new Array(COLS).fill(0).map((_, i) => i);
const cols = new Array(ROWS).fill(0).map((_, i) => i);

export const Severance = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();
  const font = useFont(require("./SF-Mono-Medium.otf"), height / ROWS);
  const pointer = useSharedValue({ x: width / 2, y: height / 2 });
  const gesture = Gesture.Pan().onChange((e) => (pointer.value = e));
  if (font === null) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1 }}>
          <CRT>
            <Group>
              <Fill color={BG} />
              {rows.map((_i, i) =>
                cols.map((_j, j) => {
                  return (
                    <Symbol
                      key={`${i}-${j}`}
                      i={i}
                      j={j}
                      font={font}
                      pointer={pointer}
                      clock={clock}
                    />
                  );
                })
              )}
            </Group>
          </CRT>
        </Canvas>
      </GestureDetector>
    </View>
  );
};
