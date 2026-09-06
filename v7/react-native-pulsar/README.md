# Pulsar source

The explorer hosts the official React Native example app from the
[v1.6.1 release](https://github.com/software-mansion/pulsar/tree/v1.6.1/react-native/PulsarApp).

- Release tag: `v1.6.1`
- Release commit: `aa9226c6f57ca60a0328bb0b9f48edb965452221`
- Upstream folder: `react-native/PulsarApp`
- Source package: `react-native-pulsar@1.6.1`

`v1.6.1` is both the newest tag on `software-mansion/pulsar` and the version
published to npm, so the vendored example and the linked native SDK match.

Note that `pulsar` is a multi-platform monorepo: it also carries an
`Android/`, `iOS/`, `flutter/`, `kmp/`, and `web/` tree, plus a top-level
`PulsarApp/` that is the **Expo** showcase app. The React Native library's own
example is the one vendored here, `react-native/PulsarApp`.

`source/official/` holds the example's `App.tsx` and `src/screens/` tree. Its
Gradle, CocoaPods, Metro, Jest, and ESLint project files are not vendored — the
explorer owns those. There are **no local adaptations**; every vendored file is
byte-identical to upstream.

The example is self-contained: `App.tsx` renders its own inline three-tab bar
(Presets / Realtime / APIs) with no third-party router, so it drops into the
catalog as a thin host (the `react-native-device-info` pattern). Its only
dependencies beyond `react-native-pulsar` — gesture-handler, Reanimated,
worklets, safe-area-context — were already installed here.

Haptics do not fire on the iOS Simulator; the screens still drive the API and
render their controls, but the physical feedback needs a device.

## Follow-up flagged for the content task

Phase D calls for a `content/decision-guides` entry comparing **Pulsar vs
expo-haptics vs react-native-haptic-feedback**. That is a separate content task
and is not written here. Both alternatives are already installed in this app
(`expo-haptics`, `react-native-haptic-feedback`), so the comparison can be
written against three live implementations.
