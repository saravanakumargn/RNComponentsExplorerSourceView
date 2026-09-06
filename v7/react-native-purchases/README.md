# RevenueCat (react-native-purchases) source

The explorer hosts the official Magic Weather example app from the
[10.5.0 release](https://github.com/RevenueCat/react-native-purchases/tree/10.5.0/examples/MagicWeather).

- Release tag: `10.5.0`
- Release commit: `1ebb65ccea6584b7f42f6729e3afe6992610936e`
- Upstream folder: `examples/MagicWeather`
- Source package: `react-native-purchases@10.5.0`

The release tag matches the `react-native-purchases` version this app already
depends on. Upstream's latest tag at vendoring time was `10.7.0`; the example
was taken from `10.5.0` so the vendored source and the linked native SDK stay
on the same version.

`source/official/` is the example's `App.tsx` and `src/` tree. Its Gradle,
CocoaPods, Metro, and Jest project files are not vendored — the explorer owns
those. The following is the only local adaptation:

1. `source/official/src/constants/index.ts` reads the explorer's RevenueCat
   public SDK key and entitlement identifier from
   `features/purchases/purchases-config.ts` instead of the upstream placeholder
   strings (upstream ships `'Your Apple App Store API Key from RevenueCat'`
   plus a `console.error` telling you to replace it). No other vendored file is
   modified — `App.tsx` still calls `Purchases.configure` and
   `Purchases.setLogLevel(DEBUG)` exactly as upstream does.

The example owns its navigation: `src/navigation/Navigation.tsx` is a
hand-rolled Home/User tab switcher plus a Paywall modal, with no third-party
router, so it drops into the explorer's catalog as a thin host with no
Expo Router adaptation (the `react-native-device-info` pattern).

## Follow-up flagged for the content task

Phase D pairs this demo with a Phase C sponsor pitch, not with a
`content/decision-guides` record. No decision-guide entry is owed here.
