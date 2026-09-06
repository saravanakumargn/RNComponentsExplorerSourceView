# Gluestack UI source

The explorer hosts the official Gluestack UI kitchen-sink app from the
[v5.0.0 release](https://github.com/gluestack/gluestack-ui/tree/v5.0.0).

- Release tag: `v5.0.0`
- Upstream folder: `apps/kitchen-sink`
- Library packages: `@gluestack-ui/core`, `@gluestack-ui/utils` (MIT)

`source/official/` is copied from that release. Local adaptations:

1. `gluestack-demo-host.tsx` hosts the upstream routes in an independent React
   Navigation tree, so the kitchen-sink's Expo Router gallery can coexist with
   the explorer's own Expo Router tree.
2. Metro resolves `expo-router` to a local adapter, and `nativewind` to
   `styles/nativewind-uniwind-adapter.tsx`, only for imports originating in
   `source/official/`.
3. `app/(home)/_tabs/*.tsx` and two `components/custom/` files take an optional
   host navigation callback so the demo host drives navigation, and the
   component grid gained accessibility roles/labels.
4. `source/official/global.css` contributes only Gluestack's palette — see
   below.
5. The vendored source is excluded from the explorer's TypeScript project,
   consistent with the other upstream demo sources.

## Theming

Upstream ships `global.css` as a standalone Tailwind entry with its own
`@import "tailwindcss"` and a `:root` / `.dark` pair. The explorer compiles a
**single** Uniwind entry for every demo (`styles/explorer.css`), because
Uniwind's metro plugin accepts exactly one `cssEntryFile`. So this file now
contributes only the palette, registered as the `gluestack-light` and
`gluestack-dark` Uniwind themes, which `GluestackDemoHost` applies with
`<ScopedTheme>`.

Two consequences worth knowing before editing it:

- Values are complete colors, not upstream's bare `R G B` triplets, because the
  shared entry reuses HeroUI's `--color-x: var(--x)` mapping rather than
  upstream's `rgb(var(--x))` form. Upstream's `@theme inline` block moved to
  `styles/themes/tokens.css`, which NativeWindUI shares.
- Uniwind requires every theme to declare the same variables. Adding a token
  here means re-running `npm run styles:generate` so the other themes get it
  too; `npm run styles:check` fails the build if that is missed.

This is also the reason the demo previously rendered completely unstyled: its
sources were not reachable from the Uniwind entry, so none of its Tailwind
classes were ever compiled.
