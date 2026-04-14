# Technical Architecture Document

## 1. System Overview
VendorFlow is a client-side, Single Page Application (SPA) built with React. It is designed to be fully functional offline, utilizing modern browser storage APIs with strong encryption.

## 2. Technology Stack
* **Frontend Framework:** React 18+ with TypeScript.
* **Build Tool:** Vite with `vite-plugin-pwa` for Progressive Web App capabilities.
* **Styling:** Tailwind CSS for utility-first styling.
* **Icons:** Lucide React.
* **Animations:** Framer Motion (motion/react).
* **PDF Generation:** jsPDF and html-to-image.
* **Data Visualization:** Recharts for the Analytics Dashboard.
* **Analytics:** Google Analytics 4 (`react-ga4`).
* **AI Integration:** `@google/genai` for Gemini API integrations (e.g., security practice lookups).

## 3. Data Architecture & Storage
* **Primary Storage:** IndexedDB (via `idb` library).
* **Fallback Storage:** `localStorage` (used if IndexedDB is unavailable, throws quota/full disk errors, or is blocked). Encrypted `ArrayBuffer` data and IVs are converted to Base64 strings for safe storage in `localStorage`.
* **Security:** All user data (invoices, clients, catalog, settings) is encrypted at rest using the Web Crypto API (AES-GCM 256-bit). The encryption key is generated locally and stored securely (falling back to `localStorage` if IndexedDB fails).

## 4. State Management
* React Context API (`StoreContext`) combined with custom hooks for global state management.
* State is hydrated from encrypted local storage on app initialization.

## 5. Monetization & Ads Integration
* **Premium State:** Managed locally, unlocks custom logos, removes watermarks, and completely suppresses all AdSense ad requests and rendering at the component level (`AdSenseAd.tsx`).
* **Ad System:** Custom hook (`useAdSystem`) manages rewarded video state. The application integrates Google AdSense for native in-feed and interstitial ads.
* **Ad Blocking Recovery:** Integrated Google Funding Choices for ad blocking recovery messaging. Includes a custom `ad-error-protection.js` script to handle ad blocker detection fallbacks and global error suppression for cross-origin script blocking, ensuring the app remains stable even when ad blockers are active.
* **Content Security Policy:** Strict CSP configuration in `index.html` allowing `pagead2.googlesyndication.com`, `fundingchoicesmessages.google.com`, and `www.gstatic.com` for scripts, frames, and connections.

## 6. Deployment
* Static site hosting (e.g., Firebase Hosting, Vercel, or Google Cloud Run via Nginx).
* PWA (Progressive Web App) ready for installable mobile experience.
