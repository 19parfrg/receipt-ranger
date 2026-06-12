@AGENTS.md

# ReceiptRanger Mobile — Architecture Notes

Expo SDK 56 / React Native / TypeScript (strict). No navigation library —
a single `screen` state drives which screen renders (`App.tsx`).

## State model

All app state lives in one provider: `src/context/AppContext.tsx`.
Screens/components consume it via `useApp()`. Receipts persist to
AsyncStorage (`@receipts` key) through `applyReceipts()`, which uses
functional `setState` updates so concurrent mutations never operate on a
stale list. Onboarding consent persists under `@consent_given`.

## OCR pipeline

```
image URI ──▶ extractTextFromImage()   (Apple Vision via expo-text-extractor;
                    │                   falls back to simulated OCR ONLY in
                    ▼                   __DEV__ — release builds fail soft,
              parseReceiptText()        never fake data)
                    │
                    ▼
              classifyText()           (regex keyword heuristics → CategoryType;
                    │                   precedence: Travel → Utilities →
                    ▼                   Entertainment → Office Supplies →
              ParsedReceipt             Food & Dining; default Food & Dining)
```

All in `src/services/OCRService.ts`. `performOCR()` returns `null` for
unreadable images and for native-engine failures in release builds —
callers must treat `null` as "show a toast, add nothing".

## Feature flags (`src/config/features.ts`)

- `DEV_TOOLS_ENABLED = __DEV__` — gates the "Simulate Local Scan" option,
  the "Reset to Mocks" option, and demo-data seeding on first launch.
  None of it can reach a TestFlight/App Store build. A fresh production
  install starts with an **empty inbox by design**
  (see `docs/app-store/review-notes.md`).
- `SIMULATED_OCR_FALLBACK = __DEV__` — keeps the scan flow testable in
  Expo Go (no native Vision module); release builds must never surface
  simulated data. Keep both flags tied to `__DEV__`.

## Release configuration

- `app.json` — bundle ID `com.parfrey.receiptranger`, `buildNumber`,
  `ITSAppUsesNonExemptEncryption=false`, and the full
  `ios.privacyManifests` block (required-reason API declarations). If you
  add a dependency that touches files/UserDefaults/network, update the
  manifest and re-run the audit in `docs/app-store/privacy-manifest-audit.md`.
- `eas.json` — `development` (dev client) / `preview` (internal) /
  `production` (store, `autoIncrement` build numbers).
- The GitHub Actions workflow builds an **unsigned** IPA as a compile
  check only; TestFlight builds go through `eas build --profile production`.

## UI gotchas

- `DetailScreen` is a native `Modal`; it renders its own `<Toast>` because
  the root-level toast overlay is invisible underneath an open modal.
- Toast timing, scan progress, and the splash delay all run on timers held
  in refs inside `AppContext` and cleared on unmount — don't add bare
  `setTimeout`/`setInterval` calls.

## Testing

See `TEST_INFRA.md`. Run `npm run tsc && npm test` before committing.
Production-flag behavior is covered in
`src/__tests__/features_production.test.tsx` — if you add a dev-only
feature, add a case there proving it's unreachable in release.
