# Zustand

**This demo is hand-written. It is not vendored upstream code.**

Every other runnable entry in this catalog vendors an official example unmodified.
Zustand publishes no React Native example: `examples/demo` and `examples/starter`
in [pmndrs/zustand](https://github.com/pmndrs/zustand) are Vite/React DOM apps
that import `react-dom` and render to a browser. There is nothing to vendor.

So `zustand-demo-host.tsx` was written for this catalog, against **zustand 5.0.14**.
The screen says so in a banner, and the source viewer points at the host file
itself rather than a `source/official/` tree, because that file *is* the demo.
Treat it as one reasonable reading of the API, not as the maintainers'.

## What it shows

1. **`create` with state and actions colocated.** The store holds `count` and
   `step` alongside the functions that change them — the shape the Zustand docs
   lead with, and the reason the library needs no provider.
2. **Selector subscriptions.** The count readout and the step picker read the
   same store through different selectors. Tapping a step button re-renders the
   picker and not the readout. This is the concrete difference from putting the
   same state in a React context, where every consumer re-renders together.
   `useShallow` is used where a component selects more than one field.
3. **Persistence.** The store is wrapped in `persist` with
   `createJSONStorage(() => AsyncStorage)` under the key `zustand-demo-counter`.
   Rehydration is asynchronous, so the first frame shows the initial state and
   then updates — visible if you look for it after a cold start.

Actions are pulled out with their own selectors. They are static references, so
subscribing to them never causes a re-render — a small point the docs make and
most first drafts get wrong.

## Storage

`@react-native-async-storage/async-storage`, already in the app. Zustand itself
is pure JavaScript with no native code, so adding it needed no rebuild.

## Related entries

Sits alongside the other state and data entries: **Legend-State** (also
hand-written, for the same reason), **TinyBase**, and **TanStack Query** — which
solves a different problem, server state rather than client state.
