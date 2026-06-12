/**
 * Build-time feature flags for ReceiptRanger.
 *
 * DEV_TOOLS_ENABLED — developer-only UI and behaviors:
 *   - "Simulate Local Scan" option in the Inbox scan sheet
 *   - "Reset to Mocks" option in Settings
 *   - Seeding the inbox with demo receipts on first launch
 *
 * Tied to __DEV__ so none of it can ever appear in a release/TestFlight
 * build. A fresh production install starts with an empty inbox by design
 * (see docs/app-store/review-notes.md).
 */
export const DEV_TOOLS_ENABLED = __DEV__;

/**
 * SIMULATED_OCR_FALLBACK — when the native text-recognition module is
 * unavailable or throws (e.g. running in Expo Go without the dev client),
 * OCRService may substitute canned receipt text so the flow stays testable.
 * Dev-only: release builds must fail soft and never surface fake data.
 */
export const SIMULATED_OCR_FALLBACK = __DEV__;
