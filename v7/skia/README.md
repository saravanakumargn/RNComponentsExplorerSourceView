# React Native Skia source

The explorer hosts the complete upstream React Native Skia example source from
the official [v2.6.4 release](https://github.com/Shopify/react-native-skia/tree/v2.6.4).

- Release commit: `99669a2718a720d7c12e0cb47247c007f8db30af`
- Upstream folder: `apps/example/src`
- Source package: `@shopify/react-native-skia@2.6.4`

`source/official/` is the copied release source. `App.tsx` has the sole local
compatibility adjustment: it wraps its upstream `NavigationContainer` in a
`NavigationIndependentTree`, allowing the example app to run within the
explorer's Expo Router navigation.
