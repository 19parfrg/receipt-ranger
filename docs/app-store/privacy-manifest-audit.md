# Privacy Manifest Audit — ReceiptRanger 1.0

Audited 2026-06-12 against Apple's "required reason API" policy
(ITMS-91053) for the iOS build produced by `npx expo prebuild` + EAS.

## Declared in `app.json` → `ios.privacyManifests`

| Accessed API category | Reason codes | Why |
| --- | --- | --- |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | C617.1, 0A2A.1, 3B52.1 | RN core/folly/glog check file timestamps inside the app container; Expo modules wrap file APIs |
| `NSPrivacyAccessedAPICategoryUserDefaults` | CA92.1 | RN settings + Expo modules read/write app-scoped UserDefaults |
| `NSPrivacyAccessedAPICategorySystemBootTime` | 35F9.1 | boost/RN timers measure elapsed time |
| `NSPrivacyAccessedAPICategoryDiskSpace` | E174.1, 85F4.1 | expo-file-system checks free space before writes (CSV export) |

Top-level declarations:

- `NSPrivacyTracking`: **false** — no tracking of any kind.
- `NSPrivacyTrackingDomains`: empty — the app makes no network requests.
- `NSPrivacyCollectedDataTypes`: empty — nothing is collected; all data
  stays in the sandbox.

## Pod-level manifests

React Native ships privacy-manifest aggregation enabled by default
(`privacy_file_aggregation_enabled: true` in `react_native_pods.rb`), so
when `pod install` runs on the EAS macOS builder, reasons declared by
statically linked pods are merged into the app-level
`PrivacyInfo.xcprivacy` alongside the categories declared above.

## App-code audit

First-party code accesses, and the module that mediates each access:

| App feature | Native surface | Notes |
| --- | --- | --- |
| Receipt persistence | AsyncStorage (UserDefaults-adjacent local store) | covered by CA92.1 |
| OCR scan | Apple Vision via `expo-text-extractor` | on-device only; no privacy-impacting API category |
| Image capture/selection | `expo-image-picker` | permission-gated; usage strings in Info.plist |
| CSV export | `expo-file-system` (documents dir) + `expo-sharing` | covered by DiskSpace/FileTimestamp reasons |
| Clipboard copy actions | `expo-clipboard` | user-initiated writes only; no reads of clipboard contents |

No first-party code touches required-reason APIs directly; all access is
through React Native/Expo, matching the declared reason codes.

## Verification performed

1. `npx expo prebuild --platform ios --no-install` — succeeds, generates
   `ios/ReceiptRanger/PrivacyInfo.xcprivacy` with all four categories above.
2. Generated `Info.plist` contains the camera and both photo-library usage
   strings, `CFBundleVersion` 1, and `ITSAppUsesNonExemptEncryption` = false.

## Remaining risk

- If a future dependency adds networking or analytics, this audit must be
  redone and `NSPrivacyCollectedDataTypes` revisited.
- Reason codes follow current Apple guidance; re-check them whenever Apple
  updates the required-reason API list (WWDC releases are the usual
  trigger).
