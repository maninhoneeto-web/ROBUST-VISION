# Security Specification: Robust Vision CCTV Firebase Integration

## 1. Data Invariants
- Each document in `feeds`, `logs`, `schedules`, `dvr_devices`, `registered_clients`, and `cloud_dvrs` must contain a `userId` field matching the authenticated user.
- Users can only read, write, update, or delete their own documents. There are no cross-user readable metrics.
- Timestamps must be validated through Firestore's server-supplied `request.time`.
- Document IDs must match standard ID formats and stay within reasonable size bounds to avoid wallet-draining/resource-poisoning attacks.

---

## 2. The "Dirty Dozen" Rogue Payloads
Here are the 12 payloads targeting common Firestore vulnerabilities:

### Payload 1: Unauthorized ID Spoofing in feeds
An attacker tries to save a Camera Feed document with a `userId` belonging to another victim user.
`write (/feeds/cam-unauthorized-1) { id: 'cam-unauthorized-1', name: 'Victim Cam', userId: 'attacker_uid_123' }` where `request.auth.uid = 'victim_uid_456'`.
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 2: Shadow Update in schedules
An attacker tries to edit another user's schedule document by injecting custom properties or updating another user's `userId`.
`update (/schedules/sched-xyz) { label: 'Rogue Sched', userId: 'new_rogue_uid' }` where original document owned by user profile is overridden.
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 3: Resource Poisoning / ID Bloating
An attacker attempts to write a document with an ID exceeding 128 characters or containing junk characters to drain storage/indexing limits.
`create (/feeds/very-long-id-junk-12345...) { name: 'Muro', userId: 'attacker_uid' }` with ID size 500.
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 4: Spoofing Verification Time on logs
An attacker tries to override the log verification time using a hardcoded client-side timestamp instead of the server timestamp request.time.
`create (/logs/log-123) { id: 'log-123', cameraName: 'Gate', status: 'OK', reason: 'Fine', timestamp: '2020-01-01T00:00:00Z', userId: 'user_uid' }` (timestamp is not `request.time`).
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 5: Anonymous Write Attempt
An anonymous (unauthenticated) user tries to write logs into the audit trial.
`create (/logs/log-anon) { ... }` where `request.auth` is null.
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 6: Mutating Immutable Fields (originalOwnerId / createdAt)
An attacker tries to edit the `createdAt` timestamp of NDSClient records to alter history.
`update (/registered_clients/client-xyz) { createdAt: '2010-01-01T00:00:00Z' }` (which differs from original value).
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 7: Unauthorized Access Device Registration
An attacker attempts to register an unauthorized MAC address scanner to monitor alerts.
`create (/dvr_devices/device-999) { id: 'device-999', addressValue: 'FF:FF:FF:FF:FF:FF', authorized: true, userId: 'victim_uid' }`
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 8: Value Poisoning of status in CameraFeed
An attacker attempts to write a completely invalid status string (e.g. 1MB string or unknown state) onto a feed.
`create (/feeds/cam-1) { id: 'cam-1', name: 'West Gate', status: 'CRITICAL_BOOM', userId: 'user_uid' }`
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 9: Client-Side Query Scraper (Blanket read)
An attacker attempts to issue a blanket pull of all clients in the system without filtering by their own `userId`.
`getDocs(collection('/registered_clients'))` without a `where('userId', '==', uid)` query filter.
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 10: State Shortcutting / Bypassing Client Restrictions
An attacker tries to update a subscription plan or payment history field directly on NDSClient when they are not an Admin.
`update (/registered_clients/client-joe) { paymentStatus: 'Pago' }` where the update is NOT verified or restricted to system.
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 11: Orphaned Records Creation
An attacker tries to insert a DVR connection entry linked to a non-existent corporate customer client.
`create (/cloud_dvrs/dvr-abc) { id: 'dvr-abc', name: 'DVR Main', userId: 'user_uid', clientRelationId: 'non-existent-id' }`
**Expected Outcome**: `PERMISSION_DENIED`

### Payload 12: Email Verification Spoofing (Unverified Email Claiming Admin)
An attacker tries to write administrative settings with an unverified email claiming a bypass.
`write (/registered_clients/client-xyz) { ... }` where `request.auth.token.email_verified` is false.
**Expected Outcome**: `PERMISSION_DENIED`

---

## 3. The Test Runner draft (`firestore.rules.test.ts`)
The `firestore.rules.test.ts` file acts as the testing harness verifying the above constraints. All write/read operations must strictly adhere to authenticated user spaces.
