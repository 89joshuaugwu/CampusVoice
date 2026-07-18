# Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Server routes + client components in one codebase, no separate backend needed |
| Language | TypeScript, strict mode | Catches the anonymous/non-anonymous branching bugs at compile time |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) | Brand palette defined once in `app/globals.css`, referenced everywhere via CSS vars |
| Auth | Firebase Auth (email/password + Google) | Optional for students — anonymous submission never requires it |
| Database | Firestore | Document model fits complaints + subcollection responses naturally |
| File storage | Cloudinary | Free tier, signed uploads, no server-side file handling needed |
| Motion | Framer Motion | Subtle animations per the brand's "measured tone" requirement |
| Charts | Recharts | Admin Reports dashboard |
| Hosting | Vercel | Free tier, zero-config Next.js deploys |

## Folder layout

```
app/
  (public)/          → PublicShell layout: landing, submit, track, auth
  (dashboard)/        → AppShell layout, requires login
    dashboard/
      admin/           → further gated: role must be "admin"
  api/                 → all server routes (see api.md)
components/
  ui/                  → atoms (Button, Input, Card, StatusBadge, etc.)
  molecules/           → ComplaintForm, ComplaintCard, ThreadMessage, etc.
  organisms/           → ComplaintThreadView, AdminQueueTable, ReportsDashboard, etc.
  shells/              → PublicShell, AppShell
lib/                   → all business logic + Firebase clients (see below)
types/                 → shared TypeScript interfaces
```

## The one design decision everything else follows from

**Anonymous complaints must be structurally anonymous** — not a hidden flag,
an actual absence of any identifying reference in the record. See
`database.md` for the schema-level explanation. This single requirement is
why:

- `/complaints` in Firestore rules is `allow read, write: if false` —
  client-side security rules can only check `request.auth`, and an
  anonymous complainant holding a tracking code has none. There's no way to
  express "let this through if it knows the code" in rules syntax, since the
  code lives in the request body, not the auth token.
- Every complaint operation therefore goes through a Next.js API route
  (`app/api/complaints/*`) using `firebase-admin`, where arbitrary
  authorization logic can run in real code instead of rules syntax.
- `lib/complaints.ts` is the single place that logic lives — `submitComplaint()`,
  `getComplaintByTrackingCode()`, `addResponse()`, `updateStatus()`, etc. All
  API routes are thin wrappers around these functions.

## Request flow (typical: student replies to their own complaint)

```
Browser (ComplaintThreadView)
  → authedFetch() attaches Firebase ID token
  → POST /api/complaints/respond
    → getAuthedUid() verifies the token server-side (lib/api-auth.ts)
    → addResponse() in lib/complaints.ts checks:
        isAdmin? OR isOwningStudent? OR isValidTrackingCode?
    → writes to Firestore via firebase-admin (bypasses client rules entirely)
    → if admin replied and studentId exists, writes a notification doc
  ← JSON response
Browser re-fetches the complaint, thread re-renders
```

## Two auth layers, deliberately redundant

1. **`middleware.ts`** — reads a `cv_role` cookie (set client-side on login)
   to redirect obviously-wrong visitors away from `/dashboard/admin/*`
   before the page even renders. This is a UX fast-path only.
2. **Every admin-gated API route** re-verifies the Firebase ID token and
   looks up the real role in Firestore server-side. This is the actual
   security boundary — a cookie can be forged, a Firestore-verified ID
   token cannot.

Full detail in `authentication.md`.
