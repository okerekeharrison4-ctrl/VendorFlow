# Security Spec

## 1. Data Invariants
- A user can only access their own user profile document.
- Sub-collections (`clients`, `catalog`, `invoices`) must be nested under `/users/{userId}/` to strictly isolate data.
- The `userId` path parameter must match `request.auth.uid` for all operations.
- The total size of any text field (name, email) cannot exceed 256 characters to prevent Resource Exhaustion.
- Invoice items array cannot exceed 100 items.

## 2. The "Dirty Dozen" Payloads
1. **User Spoofer:** Attempting to create a user document with a `{userId}` that is not the currently authenticated UI.
2. **Missing Auth Payload:** Attempting any write without an auth token.
3. **Shadow Field Injector:** Passing `{ "name": "Client", "isAdmin": true, ... }` to a client creation.
4. **Denial of Wallet (ID):** Passing a 2KB string as a `{clientId}` path parameter.
5. **Denial of Wallet (Array):** Submitting an invoice with 10,000 items.
6. **Value Poisoning (Type):** Sending `status` as a boolean (`true`) instead of a string (`'paid'` | `'unpaid'`).
7. **Value Poisoning (Enum Check):** Sending `status` as `"partial"` instead of `"paid"` or `"unpaid"`.
8. **Time Traveler:** Updating `updatedAt` to a future timestamp instead of `request.time`.
9. **Creation Time Mutation:** Attempting to change `createdAt` during an update operation.
10. **Unwanted Access (Read):** Attempting to `get` or `list` invoices from another user's subcollection.
11. **Orphan Field Updater:** Attempting to update a non-existent field, or using invalid keys.
12. **Cross-Tenant ID Spoof:** Creating an invoice but setting a foreign `userId` inside the invoice document data.

## 3. The Test Runner
A `firestore.rules.test.ts` file will verify all negative payloads fail with `PERMISSION_DENIED` and positive payloads succeed.
