# ReceiptRanger — Test Infrastructure

## Stack

| Role | Package | Version |
| --- | --- | --- |
| Runner / parser | Jest | `^29.7.0` |
| Native preset | `jest-expo` | `~56.0.5` |
| Component/hook mounting | `@testing-library/react-native` (RNTL) | `^14.0.0` |
| Types | `@types/jest` | `^29.5.14` |

Run with `npm test`. Type-check with `npm run tsc` (tests are included in
the strict TS program via `"types": ["jest", "node"]` in `tsconfig.json`).

RNTL v14 note: `render`/`renderHook` are **async** — always
`await renderHook(...)` and wrap state-mutating calls in
`await act(async () => { ... })`.

## Configuration

- `jest.config.js` — `jest-expo` preset; extends (rather than replaces)
  the preset's `transformIgnorePatterns` so `lucide-react-native` is also
  transpiled.
- `jest.setup.js` — globally mocks **all** native modules:
  - `@react-native-async-storage/async-storage` (official in-memory mock)
  - `expo-text-extractor` — URI-keyed canned OCR output: URIs containing
    `coffee` return a café receipt, `gas` a fuel receipt, `no-text` an
    empty array; anything else a generic store receipt
  - `expo-clipboard` (in-memory virtual clipboard with `_resetClipboard()`)
  - `expo-file-system/legacy`, `expo-sharing` (CSV export surface)
  - `expo-image-picker` (granted permissions; `_setCancelled()` toggle)
  - `expo-media-library`
  - `lucide-react-native` (icons stubbed to null components)

## Suites

| Suite | Covers |
| --- | --- |
| `src/__tests__/ocrservice.test.ts` | Category classification precedence, date parsing (ISO/US/month-name), receipt field extraction (total vs subtotal, tax plausibility guard, thousands separators), `performOCR` fail-soft contract |
| `src/__tests__/appcontext.test.tsx` | Init/seeding, real-OCR scan flow, archive/restore/delete/update, CSV escaping + active-only export, reset |
| `src/__tests__/features.test.ts` | Flags are tied to `__DEV__` |
| `src/__tests__/features_production.test.tsx` | Release-build behavior with flags forced off: empty first launch, `simulateUpload` no-op, reset never seeds demo data, real OCR still works |

CI runs `npm run tsc` and `npm test -- --ci` on every push/PR
(`.github/workflows/build-ios.yml`, `test` job) before the macOS build job.
