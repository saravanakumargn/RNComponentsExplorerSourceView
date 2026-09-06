# TanStack Query source

The explorer hosts the official React Native example from the
[release-2026-08-01-1558 release](https://github.com/TanStack/query/tree/release-2026-08-01-1558/examples/react/react-native).

- Release tag: `release-2026-08-01-1558`
- Release commit: `1c6a856f3cebf6b02f29bef58f889076ffda9a8a`
- Upstream folder: `examples/react/react-native`
- Source package: `@tanstack/react-query@5.101.0`

TanStack Query's repo stopped cutting `v*` tags; releases are now dated
`release-YYYY-MM-DD-HHMM` tags. `release-2026-08-01-1558` is the newest one, and
`packages/react-query/package.json` at that commit reads `5.101.0` — which is
the version pinned in this app's `package.json`.

`source/official/` holds the example's `App.tsx` and `src/` tree. Its Expo
project files (`app.json`, `babel.config.js`, `tsconfig.json`, icons) are not
vendored — the explorer owns those. There are **no local adaptations**; every
vendored file is byte-identical to upstream.

Host arrangement: the example ships its own `NavigationContainer` +
`createStackNavigator`, so it runs as an independent navigation tree (the
`heroui-native` pattern) rather than being folded into Expo Router. The
explorer's own header stays visible above it for back-to-catalog and
"View source"; the example's stack header ("Movies" / "Movie details") renders
below it and drives the in-example navigation. The two headers are stacked on
purpose — it is the only arrangement that keeps the vendored source untouched
and still leaves a route back to the catalog.

The example's `src/lib/api.ts` resolves from a bundled `movies.json` with an
artificial 200–2200 ms delay rather than hitting a network service, so the
loading, refetch-on-focus, and pull-to-refresh states are demonstrable offline.

## Follow-up flagged for the content task

Phase D calls for a `content/decision-guides` entry pairing
**Legend-State vs TinyBase vs Zustand**. That is a separate content task and is
not written here. TanStack Query itself is not part of that comparison — it
covers server state, not client state.
