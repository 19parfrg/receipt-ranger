# ReceiptRanger — App Store Release Runbook

Step-by-step path from this repository to TestFlight and the App Store,
using EAS (Expo Application Services). Mirrors the process used for Sift.

## Prerequisites

1. **Apple Developer Program membership** (active, $99/yr) on the Apple ID
   that will own the app.
2. **Expo account** — free tier is sufficient for `eas build`/`eas submit`.
3. `npm install -g eas-cli` (CLI `>= 10.0.0`, matching `eas.json`).

## One-time setup

1. `cd receipt-ranger-mobile && eas login`.
2. `eas init` — links the project to your Expo account and writes the
   `extra.eas.projectId` into `app.json`. Commit that change.
3. **App Store Connect record.** Create the app in
   [App Store Connect](https://appstoreconnect.apple.com) → My Apps → "+":
   - Platform: iOS
   - Bundle ID: `com.parfrey.receiptranger` (register it under
     Certificates, Identifiers & Profiles if prompted)
   - Name: **ReceiptRanger** (have 2–3 fallbacks ready in case of collision)
   - The marketing/description placeholders are a convenience, not a hard
     requirement, at this stage.
4. **Signing — handled by EAS.** On the first production build, EAS asks to
   log into your Apple account and then creates and stores the distribution
   certificate and provisioning profile for `com.parfrey.receiptranger`
   automatically. No local Xcode or manual certificate work is required.

## Building

```bash
cd receipt-ranger-mobile

# Internal dev client (optional, for on-device development)
eas build --profile development --platform ios

# Internal preview build (ad-hoc distribution to registered devices)
eas build --profile preview --platform ios

# Store/TestFlight build
eas build --profile production --platform ios
```

The unsigned CI artifact (`.github/workflows/build-ios.yml`) remains useful
as a compile-sanity check on every push, but TestFlight uploads must come
from the signed `production` profile.

## Submitting

```bash
eas submit --platform ios --latest
```

Any build uploaded via `eas submit` appears in TestFlight automatically
(after a short processing period and the first build's export-compliance
question, which is pre-answered by `ITSAppUsesNonExemptEncryption=false`
in the binary).

## TestFlight (recommended before public release)

1. In App Store Connect → TestFlight, add yourself as an **internal
   tester** and validate the production build on a physical device:
   - Onboarding → permission grant flow
   - Camera scan and photo-library scan of a real paper receipt
   - Edit fields, archive/restore, delete
   - CSV export through the share sheet
   - Fresh-install inbox is empty (no demo data — by design)
2. Optionally add external testers (requires a brief Beta App Review).

## Submitting for App Review

1. Fill in the App Privacy questionnaire using
   [`privacy-labels.md`](privacy-labels.md); upload screenshots per
   [`screenshots.md`](screenshots.md).
2. Paste [`review-notes.md`](review-notes.md) content into App Review notes.
3. Add the build to the 1.0 version and Submit for Review.

## Version bumping for subsequent releases

- Marketing version: bump `version` in `app.json` (e.g. 1.0.1).
- Build number: `build.production.autoIncrement` is enabled in `eas.json`,
  so EAS bumps `ios.buildNumber` automatically on each production build.
  (The `"buildNumber": "1"` in `app.json` is the starting point.)
