# NativeWindUI source

The explorer hosts the components published in the official
[NativeWindUI repository](https://github.com/roninoss/nativewindui).

- Pinned commit: `a9873635d4a2f30eb813423cee7e84671776149b` (2025-10-08)
- Upstream folders: `components/nativewindui`, `lib`, `theme`
- Package: not published to npm — the repo is the distribution

The repository has **no releases or tags**, so a commit is pinned instead of a
version. `source/official/` is a copy of the three folders above, together with
upstream's `LICENSE`.

## Why the demo screens are ours

Upstream has no per-component demo app. Its `app/` folder is a single scrolling
gallery (`app/index.tsx`) that renders every component in one screen. The
explorer gives each library a screen per component with its own "view source"
entry, so `screens/` holds explorer-authored demos instead. They render the
upstream components unmodified — only the surrounding layout is ours, which is
also why `scripts/source-viewer/manifest.mjs` points "view source" at
`screens/` rather than at `source/official/`.

The 11 components here are the complete set in the public repository. The 30+
advertised on nativewindui.com are paid and are not distributed there, so none
are vendored.

## Licence

Upstream is dual-licensed: free components under MIT, paid components under
restrictive terms (non-competition, no redistribution). Only the free MIT
components exist in the public repo, and only those are vendored here.
`source/official/LICENSE` is upstream's file, kept verbatim.

## Local adaptations

1. **Styling engine.** Upstream is NativeWind 4 + Tailwind v3
   (`tailwind.config.js`); the explorer is Tailwind v4 + Uniwind. The palette is
   ported to CSS-first form in `theme.css`, and Metro rewrites the demo's
   `nativewind` imports to `styles/nativewind-uniwind-adapter.tsx`.

2. **Platform palettes.** Upstream picks its iOS or Android colors inside the
   Tailwind config via `platformSelect()`. Tailwind v4 has no platform media
   query, so both palettes are registered as separate Uniwind themes
   (`nativewindui-{light,dark}` and `nativewindui-android-{light,dark}`) and
   `NativeWindUIDemoHost` selects between them with `Platform.OS`.

3. **`cssInterop`.** Two files — `components/nativewindui/Text.tsx` and
   `components/nativewindui/Icon/index.ts` — rely on NativeWind's `cssInterop`
   mutating a component in place. Uniwind's `withUniwind` returns a new
   component instead, so those two call it and use the returned component. Both
   edits are commented in place. Every other vendored file is byte-identical to
   upstream.

4. **Module resolution.** Metro maps the demo's project-absolute `@/…` imports
   to `source/official/`, and the vendored source is excluded from the
   explorer's TypeScript project, consistent with the other upstream demos.

## Theming

The demo's colors live in `theme.css` and are compiled through the explorer's
single Uniwind entry, `styles/explorer.css`. Variable names collide with the
other Tailwind demos by design; `<ScopedTheme>` in the host decides which
palette applies. See the comments in `styles/explorer.css` and
`scripts/styles/generate-theme-parity.mjs`.
