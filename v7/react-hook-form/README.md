# React Hook Form demo

## Sourcing

Custom demo — react-hook-form has no official React Native example app to
vendor (its examples are all web-only CodeSandbox snippets). This covers the
library's major use cases across 6 focused screens instead of a single
kitchen-sink screen, so each has a meaningful "View source" target.

- `react-hook-form` version: `7.83.0` (latest at build time)
- No `zod`/`yup` were already installed, so validation uses react-hook-form's
  built-in rules (`required`, `min`/`max`, `minLength`/`maxLength`, `pattern`,
  `validate`) rather than a schema resolver, per the sourcing instruction.

## Screens

| Screen | Covers |
| --- | --- |
| Basic Form | `Controller`-wrapped `react-native-paper` inputs, required + email pattern |
| Validation Rules | minLength/maxLength, numeric min/max, regex pattern, custom `validate`, cross-field (confirm password) |
| Field Arrays | `useFieldArray` — add/remove/reorder, array-level `minLength` rule |
| Watch & Dependent Fields | `useWatch` driving a conditional field and a live computed summary |
| Focus & Error Handling | `setFocus` on failed submit, a consolidated error list, touched-state display |
| Submit & Reset Flow | async `handleSubmit`, `isSubmitting`/`isSubmitSuccessful`/`submitCount`, `reset()` |

Every screen uses the shared `components/form-field.tsx` — a `Controller` +
`react-native-paper` `TextInput` + `HelperText` wrapper, since React Native
inputs need `Controller` rather than `register`'s uncontrolled ref API.

## Source viewer: per-screen default

This is the first demo built after switching the source viewer to a
per-screen default: `ViewSourceButton` now accepts an optional `initialPath`,
and `react-hook-form-demo-host.tsx` passes the current screen's own file path
when rendering its header, so "View source" opens on that screen first while
the file switcher still lists the whole demo (shared `form-field.tsx` plus
all 6 screens). The catalog/home screen omits `initialPath`, so it falls back
to the manifest's first entry (the demo host itself).
