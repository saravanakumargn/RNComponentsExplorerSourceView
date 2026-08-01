# React Native Maps source

The explorer hosts the complete official React Native Maps example source from
the [v1.29.0 release](https://github.com/react-native-maps/react-native-maps/tree/v1.29.0).

- Release commit: `863dc3c53aa17c0aac8c80415b91ed30d6a4f478`
- Upstream folder: `example/src`
- Source package: `react-native-maps@1.29.0`

`source/official/` is the copied release source. The local host supplies the
Expo Router boundary. The selector has local React Native 0.86 compatibility
adjustments to use standard flex scroll layout and full-width list items; its
original absolute-positioned layout collapses inside the explorer screen.
Individual demos run unchanged.

Android and the optional Google-provider mode on iOS are configured through
the `react-native-maps` plugin in the app configuration. It supplies the
native Google Maps setup while MapKit remains available as the default iOS
provider.
