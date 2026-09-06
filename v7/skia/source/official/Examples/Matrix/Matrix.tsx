// This module binds the name `Symbol`, which shadows the JavaScript global of
// the same name. The React Compiler emits `Symbol.for("react.memo_cache_sentinel")`
// for its memo cache and assumes that identifier is the global, so in a compiled
// build the generated code calls `.for()` on this module's component instead and
// throws `undefined is not a function` — crashing the screen on open. `use no
// memo` is the compiler's documented opt-out (registered by babel-preset-expo)
// and is the smallest change that keeps upstream's naming intact.
"use no memo";

import {
  BlurMask,
  Canvas,
  Fill,
  Group,
  useClock,
  useFont,
} from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions } from "react-native";

import { COLS, ROWS, Symbol } from "./Symbol";

const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);

const randomArray = (from: number, to: number, blank?: boolean) => {
  const size = Math.round(from + Math.random() * (to - from));
  const a = new Array(size).fill(0).map((_, i) => (blank ? 0 : i / size));
  return a.reverse();
};

const streams = cols.map(() =>
  new Array(3)
    .fill(0)
    .map(() => [
      ...randomArray(1, 4, true),
      ...randomArray(4, 16),
      ...randomArray(2, 8, true),
    ])
    .flat()
);

export const Matrix = () => {
  const clock = useClock();
  const { width, height } = useWindowDimensions();
  const symbol = { width: width / COLS, height: height / ROWS };
  const font = useFont(require("./matrix-code-nfi.otf"), symbol.height);
  if (font === null) {
    return null;
  }
  const symbols = font.getGlyphIDs("abcdefghijklmnopqrstuvwxyz");
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="black" />
      <Group>
        <BlurMask blur={4} style="solid" />
        {cols.map((_i, i) =>
          rows.map((_j, j) => (
            <Symbol
              symbols={symbols}
              font={font}
              timestamp={clock}
              key={`${i}-${j}`}
              i={i}
              j={j}
              stream={streams[i]}
              symbol={symbol}
            />
          ))
        )}
      </Group>
    </Canvas>
  );
};
