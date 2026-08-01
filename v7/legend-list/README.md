# LegendList source

## Upstream provenance

This feature vendors the 12 curated `screens/examples/*` demos from
LegendApp's [`legend-list`](https://github.com/LegendApp/legend-list) `example`
app (the polished showcase set; the much larger `screens/fixtures/*` folder of
developer test scenarios is not vendored).

- Upstream tag: `v3.3.3`
- Upstream commit: `a102767a464fd35df0a7aa1dc0232aaa43b54334`

Note: the app previously pinned `@legendapp/list` at `3.0.0-beta.32`, an
old pre-release with a different API (a root `LegendList` export). This
change upgrades it to `3.3.3` — the current stable release the official
example actually targets. `@legendapp/list` has no native code (pure JS), so
this was a JS-only dependency bump with no native rebuild required.

## Vendored official source

- `source/official/example/screens/examples/` — all 12 example components
  (Chat, AI Chat, Notifications Inbox, Directory, Sectioned Directory,
  Product Shelf, Cards Feed, Gallery Grid, Media Rails, Video Feed,
  Activity History, Infinite Calendar) plus their `shared.tsx`/`chatShared.tsx`
  helpers, unmodified.
- `source/official/example/api/data/` — the `rows.json` and the 24 playlist
  JSON fixtures these examples actually import (of ~70 in the upstream repo).
- `source/official/examples-shared/` — the data-generation helpers
  (`calendar.ts`, `chat.ts`, `commerce.ts`, `directory.ts`, `media.ts`,
  `random.ts`) and the `catalog.ts`/`types.ts` metadata (`CURATED_EXAMPLES`,
  `CURATED_GROUP_ORDER`) the host catalog list reuses directly.

The upstream app's Expo-Router-based `CatalogScreen`/`routes.tsx`/`app/`
plumbing is not vendored — none of the 12 example components import
`expo-router` or React Navigation themselves, so hosting them only needed a
lightweight catalog + detail screen (see below), not a second embedded router.

## Local integration only

- `legend-list-demo-host.tsx` is new host code (not vendored): a plain
  `useState`-driven catalog/detail screen (no navigation library needed,
  since the vendored screens don't use one) that groups `CURATED_EXAMPLES` by
  `CURATED_GROUP_ORDER` and renders the selected example, with a small header
  providing the catalog back button and the shared source viewer.
- `tsconfig.json` excludes `source/official` from type-checking, matching
  every other complex vendored demo.
- `metro.config.js` redirects the bare `@legendapp/list` import to
  `@legendapp/list/react-native` (its 3.x has no root export — only platform
  subpaths) so the three *other* demos that already imported the pre-3.x root
  path (`react-native-actions-sheet`, `react-native-bottom-sheet`, `gluestack`)
  keep working unmodified after the version bump.
- The demo host passes each screen's own file path as `ViewSourceButton`'s
  `initialPath` for the 5 slugs listed in `scripts/source-viewer/manifest.mjs`
  (chat, directory, media-rails, product-shelf, infinite-calendar), so "View
  source" opens on that screen's file. The other 7 examples still get a
  working source button, just defaulting to the manifest's first file.
