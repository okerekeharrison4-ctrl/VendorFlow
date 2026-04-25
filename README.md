# VendorFlow

VendorFlow is a premium, mobile-first pocket office designed for vendors, freelancers, and small business owners. It provides a seamless experience for managing invoices, clients, product catalogs, and business analytics.

## Core Features

- **Cloud Sync & Security:** Fully integrated with Firebase (Authentication & Firestore) for live real-time sync. Stringent DevTools and inspect console lockdown implemented; zero PII stored in local browser storage.
- **Invoice Management:** Create, preview, and share professional invoices (PDF, Image, WhatsApp, Email). Easily track 'Paid' and 'Unpaid' invoices with intuitive filtering.
- **Client & Catalog Management:** Maintain a database of your customers and products/services for quick invoice generation.
- **Business Analytics:** Track your sales performance, revenue, and top-selling items with beautiful charts and downloadable reports (CSV/PDF).
- **Premium "Line & Leaf" Aesthetic:** A polished, earthy, and professional design system featuring vibrant gradients, smooth layout morphing, and staggered animations.
- **Global Command Palette (Cmd+K):** A searchable, keyboard-driven interface for rapid navigation and action execution.

## Tech Stack

- **React 18+** with **Vite**
- **TypeScript**
- **Firebase:** Authentication (Google Sign-In & Email/Password) & Firestore Database
- **Tailwind CSS** for styling
- **Framer Motion** for fluid animations
- **Lucide React** for iconography
- **Recharts** for data visualization
- **html2canvas & jsPDF** for document generation

## Recent Security & Architecture Improvements

- **Firestore Integration:** Data seamlessly synchronizes with Google Cloud.
- **Inspect Console Hack-Proofing:** Eliminated client-side persistence (LocalStorage/IndexedDB) for PII (Invoices, Customers, Catalogs) preventing data scraping or modification via browser DevTools. In-memory data is instantly purged upon user logout.
- **Robust Security Rules:** Implemented Firebase Security Rules that strictly lock down reads/writes matching the `request.auth.uid`.
- **Premium Experience:** Audited and updated the ad system to ensure 100% ad suppression for premium users at the component level, preventing unnecessary network requests and rendering.
