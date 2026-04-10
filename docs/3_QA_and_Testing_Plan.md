# QA & Testing Plan

## 1. Testing Objectives
Ensure VendorFlow is reliable, secure, and fully functional across various devices (especially mobile) and network conditions (including fully offline).

## 2. Test Categories

### 2.1. Functional Testing
* **Invoicing:** Verify creation, editing, and deletion of invoices.
* **Catalog & Clients:** Ensure items and clients can be saved and retrieved accurately.
* **Templates:** Verify all 6 templates render correctly without layout distortion. Specifically test long item names and large currency values (e.g., BRL, IDR) to ensure `break-words` and `tabular-nums` maintain vertical alignment and prevent container overflow.
* **Settings:** Test currency changes, brand name updates, and bank details.

### 2.2. Storage & Security Testing
* **Encryption:** Verify data in IndexedDB/localStorage is encrypted and unreadable without the key.
* **Storage Fallback:** Simulate IndexedDB failure (e.g., full disk or private browsing mode) and ensure the app gracefully falls back to localStorage.
* **Backup/Restore:** Test JSON export and import for data integrity.

### 2.3. Export & Sharing Testing
* **PDF Generation:** Ensure PDFs are generated with correct dimensions and text.
* **Image Generation:** Test `html-to-image` rendering on Safari, Chrome, and Firefox.
* **WhatsApp Sharing:** Verify the deep link and clipboard fallback work on iOS and Android.

### 2.4. Monetization Testing
* **Premium Toggle:** Verify premium features (logo, no watermark) activate correctly.
* **Rewarded Ads:** Test the ad flow, ensuring the watermark is removed only after the ad completes.

## 3. Device & Browser Matrix
* **Mobile:** iOS Safari, iOS Chrome, Android Chrome, Android Samsung Internet.
* **Desktop:** Chrome, Safari, Firefox, Edge.

## 4. Bug Tracking
* Bugs to be logged with steps to reproduce, expected behavior, actual behavior, and device/browser info.
