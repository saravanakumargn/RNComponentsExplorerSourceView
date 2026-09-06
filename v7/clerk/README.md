# Clerk

Vendored from [clerk/clerk-expo-quickstart](https://github.com/clerk/clerk-expo-quickstart),
`NativeComponentQuickstart/`, against `@clerk/expo` 4.2.3.

## Why this variant

The upstream repo ships three quickstarts. This entry vendors the **Native
Components** one, for two reasons:

1. It demonstrates Clerk's *native* UI — `AuthView` and `UserButton` from
   `@clerk/expo/native` are real SwiftUI on iOS and Jetpack Compose on Android,
   not React Native views. That is the thing worth showing in a component
   catalog; the other two variants are hand-written React Native forms that
   happen to call Clerk hooks.
2. It is the only variant that is not coupled to Expo Router. `JSOnlyQuickstart`
   and `JSWithNativeSignInQuickstart` are built out of file-based routes and use
   `useRouter()`, `<Link href="/sign-up">`, and `<Redirect>`, all of which
   resolve against *this* app's router once vendored. Mounting either would have
   meant rewriting their navigation and no longer showing upstream's code.
   `NativeComponentQuickstart/app/index.tsx` is a single self-contained screen
   with no router imports, so it mounts unmodified.

Note that Clerk's own blog post
["Using Clerk in a React Native app"](https://clerk.com/blog/using-clerk-in-a-react-native-app)
is **out of date** relative to this SDK. It uses the older `@clerk/clerk-expo`
package and a different API surface — `signIn.create({ identifier, password })`
and `useSSO` — where `@clerk/expo` 4.x uses `signIn.password({ emailAddress,
password })` followed by `signIn.finalize({ navigate })`. The quickstart repo is
the current source of truth.

## Vendored files

| File | Origin |
|---|---|
| `source/official/app/index.tsx` | `NativeComponentQuickstart/app/index.tsx`, unmodified |
| `source/official/app/_layout.tsx` | `NativeComponentQuickstart/app/_layout.tsx`, unmodified — kept for reference, **not mounted** (see below) |
| `source/official/clerk-theme.json` | `NativeComponentQuickstart/clerk-theme.json`, unmodified |
| `source/official/app.json` | `NativeComponentQuickstart/app.json`, unmodified — shows upstream's plugin config |
| `source/official/.env.example` | `NativeComponentQuickstart/.env.example`, unmodified |

No vendored file was edited. Every adaptation below lives in the host instead.

## Local adaptations

All of these are in `clerk-demo-host.tsx`, outside the vendored tree.

- **`_layout.tsx` is vendored but not mounted.** Upstream wraps the entire app in
  `ClerkProvider` and mounts its own `<Stack>`. Doing that here would give the
  whole explorer a Clerk session and nest a second navigator inside the catalog's
  stack. The host mounts `app/index.tsx` directly and supplies `ClerkProvider`
  itself, so the provider's scope is this one demo. The file is still vendored
  and listed in the source viewer because it is where upstream shows the
  provider setup, which is the part readers need.

- **The publishable key comes from the credential gate, not the environment.**
  Upstream reads `process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` at module scope
  and throws if it is missing. This demo uses `DemoCredentialGate` with
  `credentialId: 'clerk'`, so a missing key renders a prompt instead of crashing
  the screen, and the key is stored per-device in the iOS Keychain via
  `expo-secure-store`.

  Clerk is the first consumer of `features/demo-credentials/` — the module was
  written for Picovoice, which was subsequently dropped from the roadmap.

- **`tokenCache` is upstream's.** `@clerk/expo/token-cache` is the same
  `expo-secure-store`-backed cache the quickstart uses, passed through unchanged.
  Clerk's session tokens live under Clerk's own keys; the publishable key is
  stored separately by the gate under `demo-credential.clerk`.

## Why a key is required

A Clerk publishable key names the Clerk instance the sign-in UI talks to, and
every account created through it belongs to that instance. Bundling one would
mean strangers registering accounts in someone else's Clerk project.

The key is safe to ask for: publishable keys (`pk_test_…` / `pk_live_…`) are
designed to sit in client code and grant no administrative access. Clerk's
**secret key** does, and must never be entered here — this is exactly the line
`features/demo-credentials/credential-store.ts` exists to hold.

## Native requirements

`@clerk/expo` is not a pure-JavaScript package. It ships an Expo module with an
iOS podspec plus Swift sources and Android Kotlin sources, and a config plugin.
Adding it required registering the plugin in `app.json`:

```json
["@clerk/expo", { "theme": "./features/clerk/source/official/clerk-theme.json" }]
```

followed by a `pod install` and a native rebuild. Every one of its Expo peer
dependencies — `expo-crypto`, `expo-web-browser`, `expo-auth-session`,
`expo-secure-store`, `expo-local-authentication`, `expo-apple-authentication`,
`expo-constants` — was already installed in this app, so `@clerk/expo` was the
only package added.

The theme path points at the vendored `clerk-theme.json` rather than a copy, so
the native components render with upstream's palette and there is one file to
keep in sync instead of two.

## What runs on the simulator

Signed out, the screen shows a "Sign in" button that opens `AuthView` in a
page-sheet `Modal`. Signed in, it shows the account's avatar and primary email
alongside a native `UserButton` that opens the native profile sheet.

The flows that need a real email round trip — verification codes, password
reset — work on the simulator but need an inbox you can actually reach. OAuth
providers are not configured in this variant; upstream puts Apple and Google
sign-in in `JSWithNativeSignInQuickstart` instead.
