# ReceiptRanger

Privacy-first, 100% on-device receipt scanner and expense manager for iOS.
Photos and screenshots of receipts become an actionable, exportable expense
inbox — with zero cloud uploads, zero accounts, and zero tracking.

**Status: TestFlight-ready.** Signing and submission run through EAS; see
[docs/app-store/release-runbook.md](docs/app-store/release-runbook.md).

## Repository layout

| Path | What it is |
| --- | --- |
| `receipt-ranger-mobile/` | The product: Expo React Native iOS app (TypeScript) |
| `landing.html` | Marketing landing page (deployed via GitHub Pages) |
| `index.html` | High-fidelity interactive web prototype of the app |
| `docs/app-store/` | Release runbook, App Review notes, privacy manifest audit, privacy labels, screenshot plan |
| `.github/workflows/build-ios.yml` | CI: type-check + unit tests, then unsigned `.ipa` compile-sanity build |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deploy for the landing page/prototype |

## The app (`receipt-ranger-mobile`)

- **On-device OCR** — Apple Vision via `expo-text-extractor`; a receipt
  photo is parsed into merchant, date, total, tax, and an auto-classified
  category (`src/services/OCRService.ts`). Release builds never show
  simulated data; the dev-only fallback is gated by `__DEV__`
  (`src/config/features.ts`).
- **Local-only storage** — receipts persist with AsyncStorage inside the
  app sandbox. No backend exists.
- **Expense inbox** — search, category filters, archive/restore, delete,
  editable detail view with raw OCR text.
- **CSV export** — share-sheet export of the active inbox.

### Development

```bash
cd receipt-ranger-mobile
npm install
npm run ios        # Expo dev server (OCR falls back to simulated data in Expo Go)
npm run tsc        # strict type-check
npm test           # 4 suites / 42 tests (Jest + jest-expo + RNTL)
```

See `receipt-ranger-mobile/TEST_INFRA.md` for the testing stack and
`receipt-ranger-mobile/CLAUDE.md` for architecture notes.

### Releasing

```bash
cd receipt-ranger-mobile
eas build --profile production --platform ios
eas submit --platform ios --latest    # appears in TestFlight automatically
```

Full steps (one-time Apple/Expo setup, TestFlight checklist, App Review
submission): [docs/app-store/release-runbook.md](docs/app-store/release-runbook.md).

## Privacy posture

- App Privacy label: **Data Not Collected** ([rationale](docs/app-store/privacy-labels.md))
- Privacy manifest with required-reason API declarations is embedded in
  `app.json` ([audit](docs/app-store/privacy-manifest-audit.md))
- Export compliance pre-answered: `ITSAppUsesNonExemptEncryption=false`
