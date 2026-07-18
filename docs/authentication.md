# Authentication

## Providers

- **Email/Password** — Firebase Auth, enabled in Firebase Console →
  Authentication → Sign-in method
- **Google OAuth** — same location, popup-based sign-in via
  `signInWithPopup`

Both are wired in `lib/auth.ts`.

## Roles

Two roles only: `"student"` and `"admin"`, stored on `/users/{uid}.role` in
Firestore. No department-routing hierarchy, no third role.

- **Every new signup is created as `"student"`.** There is no role picker
  on the signup form (`app/(public)/auth/signup/page.tsx`) — this is
  intentional, not an oversight.
- **There is no self-service admin creation.** See "Bootstrapping the first
  admin" below.

## Anonymous vs. authenticated — the core distinction

Auth is **optional** everywhere in the complaint flow:

| Action | Needs login? |
|---|---|
| Submit a complaint | No |
| Track a complaint (by code) | No |
| Reply to a complaint thread | No — tracking code is enough |
| View "My Complaints" | Yes (only shows complaints filed while logged in AND non-anonymous) |
| Admin queue / respond / change status | Yes, and role must be `"admin"` |

The submit form's `isAnonymous` toggle defaults to **ON** when the visitor
isn't logged in, and **OFF but still available** when they are. If a
logged-in student submits with the toggle ON, `studentId` is still stored
as `null` on that record — see `database.md` for why this matters.

## Bootstrapping the first admin

There is no signup role picker by design (see above). To create the first
admin:

1. Sign up normally through `/auth/signup` (creates a `"student"` account)
2. Firebase Console → Firestore Database → `users/{that user's uid}` →
   manually change the `role` field from `"student"` to `"admin"`
3. **Log out and log back in.** The role is read live via a Firestore
   `onSnapshot` listener in `lib/auth-context.tsx`, so a stale session
   sometimes needs a fresh login for the new role to take effect —
   this is the exact issue from testing: changing the role while already
   logged in didn't immediately unlock admin nav until re-login.

## Client-side auth state — `lib/auth-context.tsx`

`AuthProvider` wraps the whole app (`app/layout.tsx`) and exposes a
`useAuth()` hook returning:

```ts
{ user: FirebaseUser | null, role: "student" | "admin" | null, displayName: string, loading: boolean }
```

It subscribes to `onAuthStateChanged` for the Firebase user, then to a
Firestore `onSnapshot` on `/users/{uid}` for the live role — so role changes
in the Firebase Console (like the admin bootstrap step above) propagate to
an open tab without a full page reload, though as noted, route-guard timing
can still lag behind a role change made *during* an active session.

## Route protection — two layers, deliberately redundant

### 1. `middleware.ts` — fast UX redirect (NOT the security boundary)

Runs at the edge before `/dashboard/admin/*` renders. Reads a `cv_role`
cookie that's set client-side on login (`lib/auth.ts` → `setRoleCookie()`).

- No cookie at all → redirect to `/auth/login`
- Cookie says `"student"` → redirect to `/dashboard`
- Cookie says `"admin"` → let it through

This cookie **can be forged** (it's just a client-set cookie), so it is
never trusted for actual authorization — only for a faster, less jarring
redirect than waiting for a client-side check to run.

### 2. Real enforcement — server-side, per request

Every admin-gated API route (`app/api/complaints/route.ts`,
`app/api/reports/route.ts`, `app/api/categories/route.ts`'s POST/PATCH/DELETE,
etc.) does this:

```ts
const uid = await getAuthedUid(req);        // verifies Firebase ID token
const userDoc = await db.collection("users").doc(uid).get();
if (userDoc.data()?.role !== "admin") {
  return NextResponse.json({ error: "Admin access required." }, { status: 403 });
}
```

`getAuthedUid()` (in `lib/api-auth.ts`) calls
`getAdminAuth().verifyIdToken(token)` — a cryptographic verification against
Firebase, not something a client can fake.

### 3. Client-side layout guard — belt and suspenders

`app/(dashboard)/dashboard/admin/layout.tsx` also checks
`useAuth().role === "admin"` and redirects with a toast if not — this is
what makes a non-admin visiting `/dashboard/admin/queue` see a clean
redirect-and-toast instead of a broken page, even in the rare case
middleware's cookie check was stale.

## Sending an authenticated request from the client

`lib/api-client.ts` → `authedFetch()` / `authedJson()` automatically attach
the current Firebase ID token as `Authorization: Bearer <token>` if a user
is logged in:

```ts
const token = await auth.currentUser.getIdToken();
headers.set("Authorization", `Bearer ${token}`);
```

Anonymous requests (e.g. the public `/track` page replying to a complaint)
use a plain `fetch()` instead, since there's no user to attach a token for
— authorization for those instead relies on the tracking code itself,
checked server-side in `addResponse()` (`lib/complaints.ts`).

## Error messages

`lib/auth.ts` → `authErrorMessage()` maps raw Firebase Auth error codes
(`auth/email-already-in-use`, `auth/wrong-password`, etc.) to plain-language
toasts instead of surfacing Firebase's internal error strings to users.
