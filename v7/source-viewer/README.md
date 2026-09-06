# Source viewer

A reusable "view source" sheet for demos: file switcher, syntax-highlighted
code, and Copy / Share / Download actions.

## Usage

1. Add the demo's files to `scripts/source-viewer/manifest.mjs`:

   ```js
   'my-demo': [
     { path: 'features/my-demo/my-demo-host.tsx', label: 'Demo host' },
   ],
   ```

2. Run `npm run source-viewer:generate` (checked by `npm run source-viewer:check`,
   which mirrors the Maestro flow generator's `--check` convention).
3. Drop `<ViewSourceButton demoId="my-demo" />` anywhere in the demo's UI —
   commonly as a screen header's `headerRight`, or inline for single-screen
   demos. It renders nothing if the manifest has no entry for that id.
4. For multi-screen demos, pass `initialPath` so "View source" opens on the
   screen the user is actually looking at, not always the first manifest
   entry — e.g. `<ViewSourceButton demoId="my-demo" initialPath="features/my-demo/screens/foo.tsx" />`.
   The file switcher still lists every file in the manifest; `initialPath`
   only picks which tab is active when the sheet opens. Falls back to the
   first file if omitted or not found (a natural default for a demo's
   catalog/home screen). See `react-hook-form-demo-host.tsx` for the pattern:
   it looks up the current screen's own path from a `slug -> path` map and
   passes it down to a shared header component.

## How it works

- `scripts/source-viewer/generate-source-registry.mjs` validates that each
  manifest path exists and bakes only file metadata into the committed
  `generated/source-registry.ts`.
- `source-fetcher.ts` maps the app's repo-relative paths to the matching files
  in `RNComponentsExplorerSourceView/master/v7` and fetches the active file
  from GitHub on demand. The fetched content is cached in memory for the
  current app session and cancelled when the viewer closes or changes files.
- The source viewer shows loading and retry states when GitHub is unavailable;
  source content is not bundled into the app.
- `syntax-highlight-html.ts` reuses the project's existing `highlight.js` +
  `LEARNING_HIGHLIGHT_CSS` (already used for Learning content) to render
  highlighted HTML inside a `WebView`.
- `source-viewer-sheet.tsx` is a `react-native-paper` `Portal`/`Modal` — not
  tied to Expo Router or any React Navigation tree, so it works from inside a
  demo's own independent navigator too.
- Copy uses `expo-clipboard`; Share uses React Native's built-in `Share` API
  (no file needed); Download writes the file via `expo-file-system` and hands
  it to `expo-sharing` so the user can save it outside the app sandbox.
