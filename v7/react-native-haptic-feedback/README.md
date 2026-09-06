# React Native Haptic Feedback

Vendored from [mkuczera/react-native-haptic-feedback](https://github.com/mkuczera/react-native-haptic-feedback),
`example/`, at commit `07e7f4b6638740527510aa3dae5610454e709773` (v3.0.0).

## The version bump this required

The app was on `react-native-haptic-feedback` **2.3.3**. It is now on **3.0.0**,
and that upgrade was made to serve the demo rather than the other way round:

- The 2.3.3 example is a single button that fires `impactMedium`, and it imports
  `Colors` from `react-native/Libraries/NewAppScreen` — an internal RN path that
  **no longer exists in React Native 0.86**. Vendoring it would have meant
  patching the import and shipping a one-button screen.
- The 3.0.0 example is a real showcase — `useHaptics`, `Patterns`, `pattern`,
  `playHaptic`, `TouchableHaptic`, `getSystemHapticStatus` — with no internal RN
  imports. None of those APIs exist in 2.3.x.

Upgrading was the only way to vendor a current example untouched, which is the
rule this catalog runs on. It changes native code, so it needed a `pod install`
and a rebuild.

## Vendored files

| File | Origin |
|---|---|
| `source/official/App.tsx` | `example/App.tsx`, **unmodified** |
| `source/official/index.js` | `example/index.js`, unmodified — upstream entry, not mounted |
| `source/official/app.json` | `example/app.json`, unmodified |
| `source/official/src/SupportModal.tsx` | **replaced** — see below |

## The one local adaptation

`src/SupportModal.tsx` is a stub. Upstream's version is a working in-app-purchase
flow built on `react-native-iap`: three "support the maintainer" tiers, a live
StoreKit / Play Billing purchase, and the chosen tier written to AsyncStorage.

It is stubbed for two reasons:

1. `react-native-iap` is a substantial native dependency this app does not
   otherwise need, and adding it only to render a donate button would stand a
   second purchase system next to the RevenueCat demo's StoreKit configuration.
2. Presenting someone else's purchase UI inside this catalog invites a real
   payment for something the explorer neither provides nor supports.

The stub keeps the exported API identical — default component, `SupportTier`,
`SUPPORT_STORAGE_KEY`, and the unchanged pure `higherTier` — **so `App.tsx` is
vendored with no edits at all**. Opening the support sheet now shows a short
explanation instead of a purchase flow, and the tier never changes. Upstream's
real file is worth reading directly if you want the IAP pattern:
<https://github.com/mkuczera/react-native-haptic-feedback/blob/main/example/src/SupportModal.tsx>

## What runs on the simulator

The screen renders, every control works, and `getSystemHapticStatus` reports
correctly — but **the iOS Simulator has no Taptic Engine, so nothing is felt**.
That is upstream behavior, not a defect: the API calls succeed and return
normally, they simply produce no physical feedback. Judging the presets or the
pattern editor needs a real device.

## Related entries

This is one of three haptics entries, which is the point of having it:

- **Expo Haptics** — the SDK's own presets, via Expo's `native-component-list`
  screen.
- **Pulsar** (Software Mansion) — pattern composition and realtime haptics,
  worklet-compatible.
- **this one** — the long-standing community library, cross-platform, with
  patterns and system-status checks.
