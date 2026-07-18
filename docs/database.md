# Database (Firestore)

CampusVoice uses **Firestore only**. The Realtime Database that Firebase
provisions by default is intentionally locked to `.read: false, .write:
false` (`database.rules.json`) since nothing in this app uses it — see
"Why RTDB is locked but present" at the bottom.

## Collections

### `/users/{uid}`

```ts
{
  uid: string,
  email: string,
  displayName: string,
  regNumber?: string,
  role: "student" | "admin",
  createdAt: Timestamp,
}
```

Created on signup (always `role: "student"`) or on first Google login. See
`authentication.md` for how an account becomes `"admin"`.

### `/categories/{categoryId}`

```ts
{
  name: string,
  complaintCount: number,
}
```

`complaintCount` is maintained by `lib/complaints.ts` → `bumpCategoryCount()`,
called inside a Firestore transaction whenever a complaint is submitted.
This is what powers the "block delete if complaints reference it" rule in
the admin Categories page.

Default 7 categories are seeded via `scripts/seed-categories.mjs`:
Academic, Hostel/Accommodation, ICT/Portal, Harassment, Financial,
Facilities, Other.

### `/complaints/{complaintId}` — the core collection

```ts
{
  trackingCode: string,        // "CMP-2026-0043" — unique, human-typeable
  studentId: string | null,    // NULL if anonymous, no exceptions
  isAnonymous: boolean,
  title: string,
  category: string,
  description: string,
  attachments: string[],       // Cloudinary secure_urls
  status: "pending" | "in_review" | "resolved" | "rejected",
  assignedTo: string | null,   // admin uid who last changed status
  internalNotes: string,       // admin-only, NEVER exposed to public/student views
  createdAt: Timestamp,
  updatedAt: Timestamp,
  resolvedAt?: Timestamp,      // set once, when status first becomes "resolved"
}
```

#### `/complaints/{complaintId}/responses/{responseId}` (subcollection)

```ts
{
  authorRole: "admin" | "complainant",
  authorId: string | null,     // null if complainant, even if they're logged in
  message: string,
  createdAt: Timestamp,
}
```

### `/notifications/{uid}/items/{notifId}`

```ts
{
  type: "status_change" | "new_response",
  message: string,
  complaintId: string,
  read: boolean,
  createdAt: Timestamp,
}
```

Only written for complaints with a non-null `studentId` — anonymous
complainants have no account to notify, by design (there's no contact info
collected for them at all).

---

## Why `studentId: null`, not a hidden/UI-suppressed field

This is the load-bearing design decision of the whole schema. If an
anonymous complaint stored the real `studentId` but simply didn't *display*
it, genuine anonymity would depend entirely on every future feature
remembering to keep hiding it. Storing `null` instead makes
de-anonymization **structurally impossible** — there's no identifying value
in the document at all, so a Firestore console view, a rules
misconfiguration, or a careless future query can't leak it, because there's
nothing there to leak.

This holds even for the edge case that's easy to get wrong: **a logged-in
student who toggles anonymous ON.** `lib/complaints.ts` →
`submitComplaint()`:

```ts
studentId: input.isAnonymous ? null : input.studentId,
```

The fact that they were authenticated at submission time does not get
silently retained anywhere. Confirmed in `TESTING.md` Section 5 as a
specific case worth testing.

## Security rules (`firestore.rules`)

```js
match /complaints/{complaintId} {
  allow read, write: if false;
  match /responses/{responseId} {
    allow read, write: if false;
  }
}
```

**Both are entirely locked to clients.** Every complaint/response
read or write goes through a Next.js API route using `firebase-admin`,
which bypasses these client rules (admin SDK has its own trusted
credentials). This isn't a workaround — it's the only correct approach
here, because Firestore rules can only evaluate `request.auth`, and an
anonymous complainant holding a tracking code has no `request.auth` to
check. The code lives in the request *payload*, not the auth token, so no
rules expression can say "let this through if it knows the code."

Other collections:

```js
match /users/{uid} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.auth.uid == uid
    && request.resource.data.role == "student"; // no self-assigned admin
  allow update: if request.auth != null && request.auth.uid == uid
    && request.resource.data.role == resource.data.role; // can't change your own role
}

match /categories/{categoryId} {
  allow read: if true;
  allow write: if request.auth != null && getRole() == "admin";
}

match /notifications/{uid}/items/{notifId} {
  allow read, update: if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null;
}
```

Note the `/users` create rule: `request.resource.data.role == "student"`
blocks anyone from signing up with `role: "admin"` directly through the
client SDK — this is the rules-level backstop for "no admin self-signup"
mentioned in `authentication.md`.

### ⚠️ Manual publish required

Firestore rules changes never take effect until published — either:

```bash
firebase deploy --only firestore:rules
```

or Firebase Console → Firestore Database → Rules → paste → **Publish**.
This step is easy to forget and silently leaves the *old* rules active.

## Indexes (`firestore.indexes.json`)

Composite indexes needed by the queries in `lib/complaints.ts`:

| Query | Index |
|---|---|
| `listComplaintsForStudent()` | `studentId ASC, createdAt DESC` |
| `listComplaints({status})` | `status ASC, createdAt DESC` |
| `listComplaints({category})` | `category ASC, createdAt DESC` |
| `listComplaints({status, category})` | `status ASC, category ASC, createdAt DESC` |

Deploy with `firebase deploy --only firestore:indexes`, or Firestore will
throw a runtime error the first time an unindexed compound query runs, with
a console link to auto-create the missing index.

## Why RTDB is locked but present

Firebase provisions a Realtime Database instance by default on most
projects even when you never intend to use it, and its out-of-the-box
rules are wide open. Since CampusVoice's entire data model lives in
Firestore, `database.rules.json` sets:

```json
{ "rules": { ".read": false, ".write": false } }
```

...to close that instance off completely rather than leave an unused,
unsecured database sitting on the project. If a future feature genuinely
needs RTDB (e.g. typing indicators, presence), scope rules narrowly to that
specific path rather than loosening this root rule.
