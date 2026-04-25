# Disaster Recovery

## Data Loss
- All user data is governed by Google Cloud / Firebase enterprise SLAs.
- Multi-region Firestore replication natively prevents region-outage losses.

## Security Incident
- If a vulnerability in Rules is found, deploy updated `firestore.rules`.
- Invalid data can be fixed via Cloud Function migrations.
- Complete rollback of clients is mitigated by zero client-side caching of PII.
