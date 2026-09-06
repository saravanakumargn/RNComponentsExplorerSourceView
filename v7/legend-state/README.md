# Legend-State

**This demo is hand-written. It is not vendored upstream code.**

Every other runnable entry in this catalog vendors an official example unmodified.
Legend-State publishes no React Native example app: the `examples/` directory in
[LegendApp/legend-state](https://github.com/LegendApp/legend-state) contains a
single `middleware.ts`. There is nothing to vendor.

So `legend-state-demo-host.tsx` was written for this catalog, against
**`@legendapp/state` 2.1.15**. The screen says so in a banner, and the source
viewer points at the host file itself rather than a `source/official/` tree,
because that file *is* the demo.

## Check the major version before copying this

The v2 and v3 APIs differ substantially. This demo is v2:

| | v2 (here) | v3 |
|---|---|---|
| Read in a component | `useSelector(state$.x)` | `use$(state$.x)` |
| Persistence | `persistObservable` + `configureObservablePersistence` | `syncObservable` / sync plugins |

Code from the current Legend-State docs will generally not run against 2.1.15,
and vice versa. The version is pinned in `data/libraries.ts` as `demoVersion`.

## What it shows

1. **Fine-grained rendering**, which is the entire reason to reach for this
   library. Two render counters are on screen: one inside the component that
   reads `count`, one for the surrounding screen that does not.

   Tapping Increment moves **neither**. Verified on device against 2.1.15: the
   number changes while both counters stay at 1×. Legend-State updates the
   rendered value without re-running the reading component at all — the "no
   re-renders" line in its README is literal, not shorthand for "fewer".

   This is worth stating because two earlier drafts of this file got it wrong in
   opposite directions. The first put the counter beside a `<Memo>` block, where
   it counted the screen instead of the subtree. The second assumed the reading
   component would re-render and said so in the copy; the device disagreed. The
   demo now asserts only what it demonstrates.
2. **The deliberate contrast.** The name field reads through `useSelector` at
   screen level, so typing re-renders the whole screen. That is the wrong
   granularity on purpose — in real code you would wrap the input, not the
   screen — and it makes the Memo behavior legible by comparison.
3. **Persistence.** `persistObservable(state$, { local: 'legend-state-demo' })`
   writes the whole observable to AsyncStorage on every change, with no save
   call anywhere. Loading is asynchronous, so the first frame shows initial
   values.

## Storage

`ObservablePersistAsyncStorage`, configured once at module scope with the app's
existing `@react-native-async-storage/async-storage`.

Legend-State also ships an MMKV persist plugin, and `react-native-mmkv` is
installed here. AsyncStorage was chosen anyway: the MMKV plugin resolves
`react-native-mmkv`'s internals directly, which is fragile across that library's
v4 Nitro rewrite, and it would tie this demo's storage to another demo's
dependency. Legend-State itself is pure JavaScript, so adding it needed no
rebuild.

## Related entries

Sits alongside the other state and data entries: **Zustand** (also hand-written,
for the same reason), **TinyBase**, and **TanStack Query** — which solves server
state rather than client state.
