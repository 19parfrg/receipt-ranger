# App Privacy Questionnaire Answers — ReceiptRanger

Use these answers verbatim in App Store Connect → App Privacy.

## Headline answer

**Do you or your third-party partners collect data from this app?** → **No**

This yields the **"Data Not Collected"** privacy label — the strongest
label Apple offers and the core of ReceiptRanger's value proposition.

## Why "No" is accurate

- All receipt images, OCR text, and expense records are stored exclusively
  on-device (AsyncStorage inside the iOS app sandbox).
- OCR runs locally via the Apple Vision framework; images are never
  uploaded anywhere.
- There is no backend, no account system, no analytics SDK, no ads SDK,
  and no crash reporting service.
- CSV export is user-initiated and handed to the iOS share sheet; the app
  never transmits the file itself.

## Things that would change this answer (do NOT add without revisiting)

| Potential feature | Label impact |
| --- | --- |
| Analytics (even "privacy-friendly") | Usage Data → collected |
| Crash reporting | Diagnostics → collected |
| Cloud backup/sync of receipts | Financial Info + User Content → collected, linked to identity |
| Accounts/sign-in | Contact Info → collected |
| RevenueCat or other purchase SDK | Purchases → collected |

## Tracking

**Used for tracking:** No. `NSPrivacyTracking` is declared `false` in the
privacy manifest and there are no tracking domains.
