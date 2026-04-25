# Technical Architecture

## Frontend
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS, Lucide Icons.
- **State Management**: React Context (`StoreContext.tsx`) syncing directly with Firebase listeners.

## Backend & Database
- **Platform**: Firebase (Firestore for database, Firebase Auth for Identity).
- **Data Model**:
  - `users/{userId}`: Profile data, preferences, taxonomy.
  - `users/{userId}/invoices/{invoiceId}`: Secure invoice records.
  - `users/{userId}/clients/{clientId}`: Address book.
  - `users/{userId}/catalog/{itemId}`: Managed items/services.

## Security 
- **Firestore Rules**: Enforces strict `request.auth.uid == userId` checks.
- **Local Storage Policy**: Deprecated vulnerable local persistence. User session data is handled entirely in-memory upon successful Firebase auth to prevent inspect-console hacking.
