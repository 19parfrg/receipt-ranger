# App Store Screenshot Plan — ReceiptRanger

App Store Connect requires screenshots for at least one 6.9" iPhone size
(e.g. iPhone 16 Pro Max, 1320 × 2868). One set is sufficient — Apple
scales it for smaller devices. iPad screenshots (13", 2064 × 2752) are
required because `supportsTablet` is true.

## How to capture

1. `npm run ios` (or a TestFlight build) on the target simulator:
   `xcrun simctl io booted screenshot shot.png`, or ⌘S in Simulator.
2. Scan 4–6 realistic receipts first so screens look lived-in (a café
   receipt, a fuel receipt, a subscription bill, an office-supply receipt).
   In dev builds, "Simulate Local Scan (Dev)" can seed equivalent content.
3. Use the dark appearance only — the app is dark-themed.

## Shot list (in display order)

| # | Screen | Setup | Caption suggestion |
| --- | --- | --- | --- |
| 1 | Inbox with 4–6 receipts | Mixed categories so chips show variety | "Every receipt, one private inbox" |
| 2 | Scan in progress | Trigger a scan; capture the OCR progress card | "100% on-device OCR — photos never leave your phone" |
| 3 | Receipt detail | Open a receipt with clean parsed fields | "Merchant, total, tax and category — extracted automatically" |
| 4 | Detail with raw OCR open | Expand "Raw OCR Text Extraction" | "See exactly what was read. Edit anything." |
| 5 | Settings / spending breakdown | After several scans across categories | "Spending by category, computed locally" |
| 6 | CSV export share sheet | Tap "Export Expenses as CSV" | "Your data, your export — straight to email or Files" |

## Rules of thumb

- No device frames required; Apple composites plain screenshots fine.
- No pricing claims, no "beta" wording, no Apple trademarks in captions.
- Keep status bar clean: 9:41, full battery (simulator default is fine).
- Localize captions later if/when the store listing is localized.
