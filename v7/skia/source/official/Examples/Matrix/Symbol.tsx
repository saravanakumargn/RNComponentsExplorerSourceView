// This module binds the name `Symbol`, which shadows the JavaScript global of
// the same name. The React Compiler emits `Symbol.for("react.memo_cache_sentinel")`
// for its memo cache and assumes that identifier is the global, so in a compiled
// build the generated code calls `.for()` on this module's component instead and
// throws `undefined is not a function` — crashing the screen on open. `use no
// memo` is the compiler's documented opt-out (registered by babel-preset-expo)
// and is the smallest change that keeps upstream's naming intact.
"use no memo";

import React, { useRef } from "react";
import type { SkFont } from "@shopify/react-native-skia";
import { interpolateColors, vec, Glyphs } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

export const COLS = 8;
export const ROWS = 15;
const pos = vec(0, 0);

interface SymbolProps {
  i: number;
  j: number;
  timestamp: SharedValue<number>;
  stream: number[];
  font: SkFont;
  symbols: number[];
  symbol: { width: number; height: number };
}

export const Symbol = ({
  i,
  j,
  timestamp,
  stream,
  font,
  symbols,
  symbol,
}: SymbolProps) => {
  const offset = useRef(Math.round(Math.random() * (symbols.length - 1)));
  const range = useRef(100 + Math.random() * 900);
  const x = i * symbol.width;
  const y = j * symbol.height;

  const glyphs = useDerivedValue(() => {
    const idx = offset.current + Math.floor(timestamp.value / range.current);
    return [{ id: symbols[idx % symbols.length], pos }];
  }, [timestamp]);

  const opacity = useDerivedValue(() => {
    const idx = Math.round(timestamp.value / 75);
    return stream[(stream.length - j + idx) % stream.length];
  }, [timestamp]);

  const color = useDerivedValue(
    () =>
      interpolateColors(
        opacity.value,
        [0.8, 1],
        ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
      ),
    [opacity]
  );

  return (
    <Glyphs
      x={x + symbol.width / 4}
      y={y + symbol.height}
      font={font}
      glyphs={glyphs}
      opacity={opacity}
      color={color}
    />
  );
};
