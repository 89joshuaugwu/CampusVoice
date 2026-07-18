# API Reference

All routes live under `app/api/`. None of these are called directly from
Firestore client SDK for complaint data — see `database.md` for why.

**Auth convention:** routes needing a logged-in caller expect
`Authorization: Bearer <Firebase ID token>`. `lib/api-client.ts` →
`authedFetch()`/`authedJson()` attach this automatically on the client.
Public routes (submit, track) accept unauthenticated requests too — the
`Authorization` header is simply absent, and `getAuthedUid()` returns
`null` in that case rather than erroring, letting a single route serve
both anonymous and logged-in callers where relevant.

---

## Complaints

### `POST /api/complaints/submit`

Public. Creates a complaint.

**Body:**
```json
{
  "title": "string",
  "category": "string",
  "description": "string",
  "attachments": ["https://res.cloudinary.com/..."],
  "isAnonymous": true
}
```

**Response:** `{ "complaintId": "...", "trackingCode": "CMP-2026-0043" }`

If the caller has a valid Firebase ID token AND `isAnonymous` is `false`,
`studentId` is set to that uid. In every other case (`isAnonymous: true`,
regardless of login state, or no token at all), `studentId` is `null`.

---

### `POST /api/complaints/track`

Public. Looks up a complaint by tracking code.

**Body:** `{ "trackingCode": "CMP-2026-0043" }`

**Response:** the complaint + its `responses[]`, with `internalNotes`
**always stripped**, unconditionally — this route never checks role
because it's not meant to have one; it's the anonymous access path.

**Errors:** `404` with `{ "error": "No complaint found for this code." }`
if the code doesn't match any document.

---

### `GET /api/complaints`

Two modes based on query params:

- **`?mine=1`** — requires login. Returns the caller's own non-anonymous
  complaints (`listComplaintsForStudent()`).
- **No params, or `?status=X&category=Y`** — requires `role: "admin"`.
  Returns the filtered queue (`listComplaints()`), most recent first.

**Response:** `Complaint[]` (no `responses`, no `internalNotes` — see
`GET /api/complaints/[id]` for the single-complaint view that includes
those).

---

### `GET /api/complaints/[id]`

Requires login. Returns one complaint + its responses.

- If caller is `admin`: `internalNotes` is included.
- If caller is the owning student: `internalNotes` is stripped, and the
  route 403s if they're requesting someone else's complaint.
- Anyone else: `403 { "error": "You don't have access to this complaint." }`

---

### `POST /api/complaints/respond`

Public or authenticated — authorization is checked per-request, not
per-route, since a public "reply as anonymous complainant with a tracking
code" and an authenticated "reply as admin/student" both hit this same
endpoint.

**Body:**
```json
{
  "complaintId": "string",
  "trackingCode": "string | null",   // required if not logged in
  "message": "string"
}
```

Authorization passes if **any** of:
- caller is `role: "admin"`
- caller's uid matches the complaint's `studentId`
- the supplied `trackingCode` matches the complaint's actual code

Fails all three → `403 { "error": "Not authorized to reply to this complaint." }`

The stored response's `authorId` is `null` unless the replier is admin —
even a logged-in student replying via a tracking code doesn't get their
identity attached to that specific response, consistent with the
anonymity model.

---

### `PATCH /api/complaints/[id]/status`

Admin only.

**Body:** `{ "status": "pending" | "in_review" | "resolved" | "rejected" }`

Sets `assignedTo` to the calling admin's uid, stamps `resolvedAt` the
*first* time status becomes `"resolved"` (used for the average-resolution-time
metric in Reports), and writes a `status_change` notification to the
student **if** `studentId` is non-null.

---

### `PATCH /api/complaints/[id]/notes`

Admin only.

**Body:** `{ "internalNotes": "string" }`

Overwrites the complaint's `internalNotes` field. Never surfaced by any
other route to non-admin callers.

---

## Categories

### `GET /api/categories`

Public. Returns all categories, alphabetical.

### `POST /api/categories`

Admin only. **Body:** `{ "name": "string" }`. Creates with `complaintCount: 0`.

### `PATCH /api/categories/[id]`

Admin only. **Body:** `{ "name": "string" }`. Renames.

### `DELETE /api/categories/[id]`

Admin only. Blocked with a `403` and a descriptive error if
`complaintCount > 0` — this is the "can't delete a category still in use"
guard from the Categories page.

---

## Reports

### `GET /api/reports`

Admin only. Returns:

```ts
{
  totalComplaints: number,
  resolvedThisMonth: number,
  avgResolutionDays: number | null,   // null if nothing's been resolved yet
  byCategory: { category: string, count: number }[],
  byStatus: { status: ComplaintStatus, count: number }[],
  volumeTrend: { month: string, count: number }[],  // last 6 months
}
```

Computed on-demand from the full `/complaints` collection in
`lib/complaints.ts` → `getReportsData()` — no separate aggregation
collection or scheduled function, since complaint volume at FYP scale
doesn't need one.

---

## Cloudinary

### `POST /api/cloudinary/sign`

Requires no auth (any visitor submitting a complaint may need to attach a
file, logged in or not). Generates a **signed upload** signature so the
browser can upload directly to Cloudinary without exposing the API secret
client-side.

**Response:** `{ timestamp, folder, signature, apiKey, cloudName }` — the
browser then POSTs the actual file straight to Cloudinary's API using these
values (`lib/cloudinary.ts` → `uploadAttachment()`), never touching a
CampusVoice server for the file bytes themselves.

See `attachments.md` for the full upload + viewing pipeline.
