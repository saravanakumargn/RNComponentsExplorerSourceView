# TinyBase source

The explorer hosts Expo's official
[`with-tinybase`](https://github.com/expo/examples/tree/0073f46826addae3904f5ac2385a1340ab47f2c1/with-tinybase)
example.

- Release tag: none — `expo/examples` is an untagged, continuously-updated
  repo, so the commit below is the pinned revision
- Release commit: `0073f46826addae3904f5ac2385a1340ab47f2c1`
- Upstream folder: `with-tinybase`
- Source package: `tinybase@6.7.5`

## Why this source and not tinybase's own repo

`tinyplex/tinybase` ships **no React Native example app**. Its `docs/demos/`
tree is web-only (React/Solid/Svelte/vanilla against the DOM). The official
React Native example for TinyBase is Expo's `with-tinybase`, which is the source
the Phase D roadmap already names for this entry.

## Version note

TinyBase's own latest release at vendoring time was `v9.3.0`. Expo's example
pins `tinybase@^6.0.5`, and its persister wiring
(`tinybase/persisters/persister-expo-sqlite` against `expo-sqlite@~57.0.0`) is
what Expo actually tests at that pin. This app installs `^6.0.5` to match the
vendored example rather than pairing v6 example code with a v9 runtime.
`demoVersion` records the example's own package version, `6.7.5`.

`source/official/App.js` is the example's entire app, copied unchanged. Its
`app.json` and `package.json` are not vendored — the explorer owns those. There
are **no local adaptations**.

The example is self-contained with no router, so it drops in as a thin host
(the `react-native-device-info` pattern). It persists its todo table to
`todos.db` via `expo-sqlite`, so entries survive a reload.

## Follow-up flagged for the content task

Phase D calls for a `content/decision-guides` entry pairing **Legend-State vs
TinyBase vs Zustand**. That is a separate content task and is not written here.
Note that the Legend-State half of that comparison currently has no demo — see
the Phase D status notes.
