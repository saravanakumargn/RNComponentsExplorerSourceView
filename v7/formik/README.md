# Formik demo

## Sourcing

Custom demo — Formik has no official React Native example app to vendor.
Mirrors the react-hook-form demo's structure (same 6-topic breakdown) so the
two are easy to compare, adapted to Formik's actual API where the two
libraries genuinely differ.

- `formik` version: `2.4.9` (latest at build time)
- `yup` was not already installed, so validation uses Formik's `validate`
  function (built-in fallback) rather than a schema resolver, per the
  sourcing instruction.

## Screens

| Screen | Covers |
| --- | --- |
| Basic Form | `useField`-wrapped `react-native-paper` inputs, required + email pattern |
| Validation Rules | minLength/maxLength, numeric range, regex pattern, cross-field (confirm password) — all in one `validate` function |
| Field Arrays | `FieldArray` — add/remove/reorder, array-level minimum-guest check |
| Dependent Fields | Reading `values` directly (Formik's equivalent of "watch") to drive a conditional field and a live computed summary |
| Focus & Error Handling | Manual ref-based focus of the first invalid field (Formik has no `setFocus`), a consolidated error list, touched-state display |
| Submit & Reset Flow | Async `onSubmit`, `isSubmitting`/`dirty`/`submitCount`, `resetForm()` |

Every screen uses the shared `components/formik-field.tsx` — a `useField` +
`react-native-paper` `TextInput` + `HelperText` wrapper, since Formik's
`handleChange`/`handleBlur` expect DOM synthetic events that RN inputs don't
produce.

### Where this intentionally differs from react-hook-form

- **No watch() step.** Formik's context re-renders the whole form on every
  keystroke, so `values` inside the render-prop function is always current —
  there's no separate subscription API to opt into. The "Dependent Fields"
  screen name (vs. RHF's "Watch & Dependent Fields") reflects that.
- **No setFocus().** Formik doesn't ship a focus-management helper, so
  "Focus & Error Handling" wires refs through `formik-field.tsx`'s forwarded
  ref manually and focuses the first field with a validation error itself.

## Source viewer

Wired the same way as react-hook-form: `formik-demo-host.tsx` maps each
screen's slug to its own file path and passes it as `ViewSourceButton`'s
`initialPath`, so "View source" opens on the screen you're looking at, with
the file switcher still listing every file in the demo.
