# Original User Request

## Initial Request — 2026-06-07T14:34:49-05:00

Create ReceiptRanger, a privacy-first, 100% on-device receipt scanner and expense manager for iOS that turns photos/screenshots of receipts into an actionable, exportable expense inbox.

Working directory: C:\Users\grant\Documents\antigravity\quirky-chandrasekhar
Integrity mode: development

## Requirements

### R1. Marketing Landing Page (`landing.html`)
Create a visually stunning, responsive landing page emphasizing the privacy-first, on-device OCR value proposition. It must use custom typography, sleek gradients, micro-animations, and structured sections (Hero, Value Proposition, Feature Showcase, Security Guarantee, and Waitlist Sign-up).

### R2. Interactive Web Prototype (`index.html`)
Build a high-fidelity interactive web prototype using CDN-based Tailwind CSS, Lucide icons, and a centralized state-driven JS architecture (similar to Sift). 
- **Centralized State:** Use a central `state` object and a `go()` function to apply state updates and trigger an idempotent `render()` loop.
- **Features:** 
  - An inbox list of receipts (preloaded with 3-4 realistic mock receipts).
  - Ability to "upload" a receipt (simulates local OCR scanning with a progress bar).
  - Categorization chips (Food & Dining, Travel, Office Supplies, Entertainment, Utilities).
  - Receipt details panel (Editable Merchant Name, Date, Amount, Category, and Tax).
  - Export workflow (simulates generating and downloading a CSV of the active expenses).
  - Archive/Delete triage gestures/actions.

### R3. Expo React Native Boilerplate (`receipt-ranger-mobile`)
Initialize an Expo React Native iOS application using TypeScript in a subdirectory `receipt-ranger-mobile`.
- **Boilerplate Setup:** Must include expo-media-library, expo-image-picker, and typescript configurations.
- **Views Skeleton:** Scaffold files representing:
  - Onboarding (explaining on-device privacy permissions).
  - Inbox View (list of scanned receipts).
  - Receipt Detail View (extracted text, edit details, copy actions).
  - Settings & Export View.

## Acceptance Criteria

### Web Interface & Prototype
- [ ] `landing.html` contains interactive FAQ accordion and working mockup displays.
- [ ] `index.html` uses the centralized `state` and state patching (`go()`) model.
- [ ] Web prototype allows editing receipt properties (Merchant, Amount, Date, Category) and updates the local state reactively.
- [ ] Web prototype contains a "Simulate Upload" action that runs an animation and adds a new receipt to the list.
- [ ] Web prototype provides an "Export CSV" button that generates a real CSV download in the browser.

### Mobile Scaffolding
- [ ] Directory `receipt-ranger-mobile` is successfully initialized with Expo SDK.
- [ ] Mobile codebase is configured for TS and compiles without syntax errors.
- [ ] `Info.plist` permissions for `NSPhotoLibraryUsageDescription` are configured in `app.json`.

## Follow-up — 2026-06-08T12:00:28-05:00

Configure and set up the private beta compilation for ReceiptRanger on iOS. Replicate the Sift project's GitHub Actions build pipeline to package the Expo React Native app into an unsigned `.ipa` artifact, maintain the local-only data storage paradigm, and notify the user on Telegram.

Working directory: C:\Users\grant\Documents\antigravity\quirky-chandrasekhar
Integrity mode: development

## Requirements

### R1. GitHub Action Dev Client Build Workflow (`build-ios.yml`)
Create a workflow `.github/workflows/build-ios.yml` to compile the `receipt-ranger-mobile` Expo React Native project into an unsigned `.ipa` file using macOS-15 runners. 
- Must prebuild the iOS platform (`ReceiptRanger.xcworkspace`, scheme `ReceiptRanger`).
- Package the output `ReceiptRanger.app` into a `Payload` directory, zip it as `ReceiptRanger-unsigned.ipa`, and upload it as a workflow artifact.

### R2. Local-Only Storage Preservation
Keep all receipt records, OCR results, and expense stats strictly on-device (via SQLite/AsyncStorage) inside the application sandbox. Do not implement any remote server data synchronization, preserving the app's zero-cloud, absolute privacy value proposition.

### R3. Commit and Push to Remote
Ensure all workflow configurations are committed and pushed to the remote repository `19parfrg/receipt-ranger` to automatically trigger the Pages deploy and the iOS compilation.

### R4. Telegram Completion Notification
Configure the pipeline to send a Telegram message to Grant using the Antigravity Bot credentials when the task is complete.

## Acceptance Criteria

### iOS Build Pipeline
- [ ] `.github/workflows/build-ios.yml` is created with correct paths for `receipt-ranger-mobile`.
- [ ] The workflow targets the `-workspace ReceiptRanger.xcworkspace` and `-scheme ReceiptRanger` with code signing disabled.
- [ ] Files are successfully committed and pushed to the remote repository.

### Notification
- [ ] Telegram notification is sent upon completion indicating project name and status.

