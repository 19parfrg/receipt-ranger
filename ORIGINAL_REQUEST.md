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
