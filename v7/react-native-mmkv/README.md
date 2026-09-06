# React Native MMKV source

The explorer hosts the official example screen from the
[v4.3.0 release](https://github.com/mrousavy/react-native-mmkv/tree/v4.3.0/example).

- Release tag: `v4.3.0`
- Release commit: `cd53e0b8faeb47672f79171e1764407a07daa5e2`
- Upstream folder: `example`
- Source package: `react-native-mmkv@4.3.0`

The release tag matches the `react-native-mmkv` version this app already
depends on. Upstream's latest tag at vendoring time was `v4.3.2`.

`source/official/App.tsx` is the example's entire screen, copied unchanged.
Its Gradle, CocoaPods, Metro, and Jest project files are not vendored — the
explorer owns those. There are no local adaptations: the example is a
single self-contained screen with no router and no project-local imports, so
it drops in as a thin host (the `react-native-device-info` pattern).

The example reads `useColorScheme()` for its own light/dark styling. The
explorer is light-appearance only, so it always renders the example's light
palette — that is upstream behavior under a light system appearance, not a
local change.
