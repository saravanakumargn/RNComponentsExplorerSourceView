# React Native WebView source

The explorer hosts the official example app from the
[v13.16.1 release](https://github.com/react-native-webview/react-native-webview/tree/v13.16.1/example).

- Release tag: `v13.16.1`
- Release commit: `f087ea96e71f55c189b666713d9895936afe0948`
- Upstream folder: `example`
- Source package: `react-native-webview@13.16.1`

The release tag matches the `react-native-webview` version this app already
depends on. Upstream's newest tag at vendoring time was `v16.0.0`, but npm's
`latest` was `14.0.1`; the example was taken from the tag that matches the
linked native SDK.

`source/official/` holds the example's `App.tsx`, its `examples/` screens, and
`assets/test.html`. Its Gradle, CocoaPods, Metro, Windows, macOS, and visionOS
project files are not vendored — the explorer owns those. The `.windows.tsx`
variants are kept for fidelity; Metro never resolves them on iOS.

Local adaptations:

1. `metro.config.js` (host, not vendored source) adds `html` to
   `resolver.assetExts` so the example's `require('../assets/test.html')` in
   `examples/LocalPageLoad.tsx` resolves. Upstream's own Metro config does the
   same thing.
2. `source/official/examples/CustomMenu.tsx` declares its component before
   exporting it. Upstream writes `export default CustomMenu = () => {`, an
   assignment to an undeclared identifier that only evaluates in sloppy mode.
   This app's modules are strict, so loading `App.tsx` threw
   `Property 'CustomMenu' doesn't exist` and took the entire example down at
   import time. The fix is `const CustomMenu = () => { ... }` plus
   `export default CustomMenu;` — no behavior change. Worth reporting upstream.

The example owns its navigation: `App.tsx` is a single screen with an inline
button row that swaps the active test, with no third-party router, so it drops
into the explorer's catalog as a thin host (the `react-native-device-info`
pattern).
