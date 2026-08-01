# HeroUI Native source

The explorer hosts the complete official HeroUI Native example app from the
[v1.0.6 release](https://github.com/heroui-inc/heroui-native/tree/v1.0.6).

- Release tag: `v1.0.6`
- Release commit: `e1094538beaf1c59f209070e13979b9e5811efb0`
- Upstream folder: `example`
- Source package: `heroui-native@1.0.6`

`source/official/` is copied from that release. The following are the only
local adaptations:

1. `source/official/global.css` imports the released `heroui-native/styles`
   stylesheet and scans `node_modules/heroui-native/lib`, replacing the
   upstream monorepo-development references to `../src`.
2. `heroui-native-demo-screen.tsx` hosts the upstream routes in an independent
   React Navigation tree. This lets its Expo Router-based gallery coexist with
   the explorer's Expo Router tree.
3. Metro resolves `expo-router` and `expo-router/react-navigation` to local
   compatibility adapters only when the import originates in
   `source/official/`. The rest of the explorer's imports are unchanged.
4. The vendored source is excluded from the explorer's TypeScript project,
   consistent with the other upstream demo sources.

The release example has no project-local absolute `@/` imports, so no alias
resolver was added.
