# App Review Notes — ReceiptRanger 1.0

ReceiptRanger is a privacy-first, 100% on-device receipt scanner and
expense inbox. There is **no backend, no account system, and no network
traffic**: OCR runs locally via the Apple Vision framework
(`expo-text-extractor`), and all records are stored in the app sandbox
with AsyncStorage.

**How to test**

1. On first launch you'll see a privacy onboarding screen; tap
   "Grant Permissions & Continue" (Camera + Photo Library).
2. A fresh install starts with an **empty inbox by design** — the app's
   content comes entirely from receipts the user scans. To create content,
   tap the floating scan button and either:
   - **Take Photo (Camera):** point at any paper receipt, or
   - **Choose from Gallery (Photos):** pick a photo/screenshot of a
     receipt (any store receipt, ride summary, or subscription bill
     screenshot works).
3. The scan runs on-device OCR and opens a detail view with the extracted
   merchant, date, total, tax, and an auto-assigned category. All fields
   are editable; the raw recognized text is viewable under
   "Raw OCR Text Extraction".
4. Archive/restore and delete actions are available on the detail view.
5. Settings tab → "Export Expenses as CSV" generates a CSV of the active
   inbox and opens the iOS share sheet.
6. Settings tab → "Reset or Clear Database" permanently clears local data.

**Permissions**

- Camera: capture paper receipts for on-device OCR.
- Photo Library: select existing receipt photos/screenshots.
- The app remains usable (browse/edit/export) if permissions are denied;
  scanning prompts the user to enable access in iOS Settings.

**Privacy**

- No data collection of any kind; the App Privacy label is
  "Data Not Collected".
- No third-party SDKs that phone home, no analytics, no ads.
- Export compliance: only exempt encryption
  (`ITSAppUsesNonExemptEncryption=false`).
