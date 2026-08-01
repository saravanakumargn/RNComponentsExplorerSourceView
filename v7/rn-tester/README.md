# RNTester source

This directory vendors the `js/` tree from the official React Native
[`v0.86.0` release](https://github.com/facebook/react-native/tree/v0.86.0/packages/rn-tester),
commit `a632f9efe24bac8b3a113c78469948f55bde0f5d`.

The source remains Flow JavaScript and is compiled by Metro. The Expo wrapper
is `rn-tester-demo-screen.tsx`; do not rewrite individual examples as local
demos.

The iOS registry excludes RNTester-only native test entries: New Architecture,
Fabric Interop, ActionSheet screenshot support, RCTRootView, Snapshot, and the
TurboModule/legacy-native-module examples. The documentation-link helper uses
`expo-web-browser`, and RNTester-only startup instrumentation is omitted. The
Expo Router wrapper provides the root-list Back action; a demo's Back action
continues to return to the RNTester list.
