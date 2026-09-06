# ElevenLabs

Vendored from [elevenlabs/packages](https://github.com/elevenlabs/packages),
`examples/react-native-expo/`, against `@elevenlabs/react-native` 1.2.18.

## Vendored files

| File | Origin |
|---|---|
| `source/official/App.tsx` | `examples/react-native-expo/App.tsx` — **one adaptation**, see below |
| `source/official/VolumeBar.tsx` | unmodified |
| `source/official/FrequencyBands.tsx` | unmodified |
| `source/official/ImageUpload.tsx` | unmodified |
| `source/official/index.js` | unmodified — upstream's `registerRootComponent` entry, kept for reference, not mounted |
| `source/official/app.json` | unmodified — shows upstream's plugin config |
| `source/official/.env.example` | unmodified |
| `source/official/README.md` | unmodified |

## The one local adaptation

`App.tsx` line ~57, inside `startConversation`:

```diff
- agentId: process.env.EXPO_PUBLIC_AGENT_ID,
+ agentId: getCachedCredential("elevenlabs") ?? process.env.EXPO_PUBLIC_AGENT_ID,
```

This is not a style change, it is load-bearing. Babel's Expo preset **inlines
`process.env.EXPO_PUBLIC_*` at build time**, so upstream's line compiles down to
whatever the env var held when the bundle was built — `undefined` here. An agent
ID typed into the demo at runtime could never reach `startSession`. Reading the
credential store's synchronous cache is what makes bring-your-own-key possible at
all. The env var is kept as the fallback so the file still behaves like upstream
for anyone copying it out.

This mirrors the RevenueCat entry, whose vendored `src/constants/index.ts` is
adapted the same way and for the same reason.

## How the demo is scoped

`elevenlabs-demo-host.tsx` requires the vendored `App` **inside** the component
rather than at module scope. `@elevenlabs/react-native` calls LiveKit's
`registerGlobals()` at import time, which installs `RTCPeerConnection`,
`MediaStream`, and the rest of the WebRTC browser API onto the global object.
Importing eagerly would do that to every user of the explorer at app start;
requiring lazily confines it to people who open this demo.

Upstream's `index.js` mounts `App` with `registerRootComponent`. Here the catalog
route mounts `App` directly — it already contains its own `ConversationProvider`,
so nothing else is needed.

## Why a key is required, and which key

The demo asks for an **Agent ID**, gated by `DemoCredentialGate`. An agent ID is
not a secret: a public agent accepts a connection from any client that has one.
That is precisely why it cannot be shipped here — every conversation the agent
speaks bills to the account that owns it, so the demo spends your usage, not
someone else's.

Private agents will not connect on an ID alone. They require a signed URL minted
server-side from an API key, which an on-device demo has no way to produce, and
the API key itself is a server secret that must never be entered here. Upstream's
own README says the same thing under "Security consideration".

## Dependency versions are pinned by the SDK, not chosen

`@elevenlabs/react-native` 1.2.18 peers on `@livekit/react-native-webrtc ^137.0.2`.
Current `@livekit/react-native` (2.10+) peers on `^144`, which is incompatible, so
the LiveKit SDK is held at **2.9.6** — the last version on the 137 line. Installed set:

| Package | Version | Why this one |
|---|---|---|
| `@elevenlabs/react-native` | 1.2.18 | latest |
| `@livekit/react-native` | 2.9.6 | last version peering on WebRTC 137 |
| `@livekit/react-native-webrtc` | 137.0.3 | required by the ElevenLabs SDK |
| `@livekit/react-native-expo-plugin` | 1.0.2 | latest |
| `@config-plugins/react-native-webrtc` | 15.0.1 | latest; peers `expo ^56` while this app is 57 |

Two of those are worth flagging on any upgrade:

- **`@config-plugins/react-native-webrtc` has no Expo 57 release.** 15.0.1 declares
  `expo ^56`. It is installed anyway (this project already uses
  `--legacy-peer-deps`) and both prebuild and `pod install` succeed, but the peer
  range is a real mismatch, not a warning to dismiss permanently.
- **Bumping `@livekit/react-native` past 2.9.6 will break this demo** until
  ElevenLabs moves to the WebRTC 144 line. The version pin is the constraint, not
  a preference.

## What this costs the binary

`@livekit/react-native-webrtc` pulls `WebRTC-SDK 137.7151.09`, a full WebRTC
implementation, into the shipping binary permanently, for every user of the
explorer. That cost was accepted deliberately for this demo and declined for a
standalone LiveKit room-join demo, which is documented as a reference entry
instead — see `features/livekit/livekit-reference.ts`.

It compiles under this app's `useFrameworks: static` setting, which is worth
recording because `react-native-webrtc` and static frameworks have a long history
of not coexisting.

## What runs on the simulator

The conversation UI, status transitions, text-only mode, and the connection-type
toggle (WebRTC / WebSocket) all work. **Voice does not**: the iOS Simulator has no
real microphone input, so the volume bar and frequency bands stay flat and the
agent hears nothing. Text mode is the way to exercise a real conversation without
a device. `ImageUpload` uses `expo-image-picker` against the simulator's photo
library, which is empty on a fresh device.
