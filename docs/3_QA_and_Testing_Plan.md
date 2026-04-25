# QA and Testing Plan

## 1. Security & Privacy Testing
- **DevTools Inspection**: Ensure no PII (Invoices, Clients) is visible in localStorage.
- **Firestore Rules Evaluation**: Red-team testing against missing auth, unauthorized reads, and cross-tenant data modification.

## 2. Functional Testing
- Verify Google OAuth popup works correctly.
- Verify real-time Cloud Sync correctly reflects cross-tab additions.
- PDF Generation formatting.

## 3. Performance
- Ensure real-time snapshot listeners properly detach upon logout to prevent memory leaks.
