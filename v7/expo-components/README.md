# Expo Components source

## Upstream provenance

This feature vendors the current `main` source from Expo's
[`apps/native-component-list`](https://github.com/expo/expo/tree/21b0db4667721fe08eb65f37187d7f7532e5cb54/apps/native-component-list)
directory.

- Upstream commit: `21b0db4667721fe08eb65f37187d7f7532e5cb54`
- Downloaded GitHub archive SHA-256:
  `68c6c3081fb9f9f41e4c01d3241af67819f2a83f866937e52769bdcae80bf8bb`

## Vendored official source

- `source/official/native-component-list/App.tsx`
- `source/official/native-component-list/src/`
- `source/official/native-component-list/assets/`
- `source/official/common/ThemeProvider.tsx` (the upstream provider required by
  the source tree)
- `source/official/test-suite/screens/getScreenIdForLinking.ts` (the upstream
  route helper imported by the official navigator)
- `source/official/bare-expo/modules/worklets-tester/src/` (the upstream
  optional-worklets module imported by the official navigator)

The vendored files are copied directly from the archive. Three navigator files
have a small host integration patch: they add the catalog Back button, replace
the embedded bottom tabs with a top API/Components control, and hide the
embedded tab bar. Keep all other vendored source unchanged when updating from
upstream.

## Local integration only

- `native-component-list-entry.tsx` creates an independent React Navigation
  tree so the upstream navigator can run inside Expo Router. The surrounding
  catalog route retains its app-level Back button, while the official navigator
  retains its own list and screen navigation.
- `react-navigation-native-adapter.tsx` leaves the independent navigator in
  control of its headers. `catalog-navigation-bridge.ts` connects the back
  buttons added to its two top-level headers to the surrounding library catalog.
  `expo-catalog-segmented-control.tsx` provides the host-owned top switcher
  rendered by the official root screens.
- `features/catalog/library-detail-screen.tsx`, `metro.config.js`, and
  `tsconfig.json` only mount or resolve the upstream source.
- `expo-platform-compat.ts` bridges the upstream Expo 56 `Platform` export to
  the host app's Expo 57 runtime without changing vendored source.
- The Metro resolver also maps the upstream HTML-elements private `View`
  subpath to the equivalent host package source.
- `test-expo-ui-unavailable.tsx` is a host adapter for Expo's bare-expo-only
  test native module. The official screen detects that the native module is not
  linked and retains its upstream unavailable-environment state.
- `benchmarking-unavailable.ts` exposes the bare-expo-only benchmark modules as
  unavailable, so the official benchmark screen preserves its own `Skipped`
  state in this host.
