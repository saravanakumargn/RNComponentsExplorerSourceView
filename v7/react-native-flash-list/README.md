# FlashList source

## Upstream provenance

This feature vendors the official `fixture/react-native` example app from
Shopify's [`flash-list`](https://github.com/Shopify/flash-list) repository.

- Upstream tag: `v2.0.2` (matches the installed `@shopify/flash-list` version)
- Upstream commit: `a102767a464fd35df0a7aa1dc0232aaa43b54334`

## Vendored official source

All 16 non-excluded example screens, the `contacts/` and `Debug/` support
modules, and the images they use, copied unmodified from
`fixture/react-native/src`.

### Excluded

`Twitter*`, `TwitterFlatList`, `TwitterBenchmark`, `Messages*`, and
`ComplexMasonry` are not vendored: they (and `CellRendererExamples`, which
reuses the Twitter cell components) depend on `@d11/react-native-fast-image`,
a package this app does not otherwise install. Everything else — List, Grid,
Masonry, SectionList, PaginatedList, HorizontalList, Carousel, Reminders,
Contacts (+ SectionList variant), DynamicItems, DynamicColumnSpan,
HeaderFooterExample, RecyclerViewHandlerTest, MovieList, LayoutOptions, Chat,
and ShowcaseApp — is vendored as-is.

### Small integration patches

- `constants.ts` and `ExamplesScreen.tsx`: trimmed to drop the excluded
  screens' `RootStackParamList` entries and list rows (no other lines
  changed).
- `NavigationTree.tsx`: drops the excluded screens' imports/registrations, and
  adds `headerLeft`/`headerRight` on the root `Examples` screen so it can exit
  back to the catalog and open the shared source viewer (see below). It also
  takes an `initialDemo` prop and a `screenLayout`, so the route smoke suite can
  open one screen directly and assert it mounted — see `e2e/smoke/README.md`.
- `constants.ts` additionally exports `ROUTE_NAMES`, the same route names as a
  value, so the navigator can reject an unknown `?demo=` link.

## Local integration only

- `react-native-flash-list-demo-host.tsx` mounts the vendored `App` inside a
  `NavigationIndependentTree` (matching the pattern other multi-screen demos
  use) and wires `catalog-navigation-bridge.ts` so the vendored root screen's
  back button returns to the surrounding catalog — the same bridge pattern
  `expo-components` already uses.
- Metro resolves the fixture's bare `require("assets/checkboxOn.png")`-style
  imports (used only by `Reminders.tsx`) to this feature's vendored `assets/`
  folder via a scoped rule in the root `metro.config.js`.
- `tsconfig.json` excludes `source/official` from type-checking, matching
  every other complex vendored demo.
- `NavigationTree.tsx` sets a per-screen `headerRight` `ViewSourceButton` with
  `initialPath` on the 5 screens listed in `scripts/source-viewer/manifest.mjs`
  (List, Grid, Masonry, SectionList, HeaderFooterExample), so "View source" on
  each of those opens on that screen's own file. Screens not in the manifest
  still get a working source button (via the root screen's), just without a
  per-screen default.
