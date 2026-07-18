# Pages & Routes

Two route groups, each with its own layout and shell:

- **`(public)`** → `PublicShell` — landing, submit, track, auth. No login
  required for any of these.
- **`(dashboard)`** → `AppShell` — requires login (redirects to
  `/auth/login` otherwise). A nested `admin/` segment additionally requires
  `role: "admin"`.

---

## Public routes

| Route | File | Access | Purpose |
|---|---|---|---|
| `/` | `app/(public)/page.tsx` | Anyone | Landing page — hero, how-it-works, category chips, CTA |
| `/submit` | `app/(public)/submit/page.tsx` | Anyone | Complaint submission form, works with or without login |
| `/track` | `app/(public)/track/page.tsx` | Anyone | Tracking code entry point |
| `/track/[trackingCode]` | `app/(public)/track/[trackingCode]/page.tsx` | Anyone with the code | Full thread view, reply box, no login |
| `/auth/signup` | `app/(public)/auth/signup/page.tsx` | Anyone | Student signup — email/password or Google. Always creates `role: "student"` |
| `/auth/login` | `app/(public)/auth/login/page.tsx` | Anyone | Shared login for students and admins |

## Dashboard routes (require login)

| Route | File | Access | Purpose |
|---|---|---|---|
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Any logged-in user | Role-adaptive home — student sees quick actions + recent complaints, admin sees stat cards + shortcuts |
| `/dashboard/my-complaints` | `.../my-complaints/page.tsx` | Student (any logged-in user) | List of complaints filed while logged in and non-anonymous |
| `/dashboard/my-complaints/[id]` | `.../my-complaints/[id]/page.tsx` | Owning student only (403 otherwise) | Full thread view via `ComplaintThreadView` with `authContext="student"` |

## Admin-only routes (require `role: "admin"`)

Gated by `app/(dashboard)/dashboard/admin/layout.tsx`, which redirects +
toasts non-admins back to `/dashboard`.

| Route | File | Purpose |
|---|---|---|
| `/dashboard/admin/queue` | `.../admin/queue/page.tsx` | Filterable/sortable complaint queue, desktop table / mobile cards |
| `/dashboard/admin/queue/[id]` | `.../admin/queue/[id]/page.tsx` | Full thread view via `ComplaintThreadView` with `authContext="admin"` — status dropdown + internal notes |
| `/dashboard/admin/categories` | `.../admin/categories/page.tsx` | Add/edit/delete complaint categories |
| `/dashboard/admin/reports` | `.../admin/reports/page.tsx` | Metrics cards + bar/donut/line charts, CSV/PDF export |

## Layouts

| File | Applies to | Behavior |
|---|---|---|
| `app/layout.tsx` | Everything | Fonts, `<AuthProvider>`, `<ToastProvider>`, metadata/favicon |
| `app/(public)/layout.tsx` | All `(public)` routes | Wraps in `PublicShell` |
| `app/(dashboard)/dashboard/layout.tsx` | All `(dashboard)` routes | Client-side: redirects to `/auth/login` if not authenticated, else wraps in `AppShell` |
| `app/(dashboard)/dashboard/admin/layout.tsx` | All `admin/` routes | Client-side: redirects to `/dashboard` + toast if `role !== "admin"` |

## Middleware

`middleware.ts` runs at the edge, matched only against
`/dashboard/admin/:path*`. Reads the `cv_role` cookie for a fast
pre-render redirect — **not** the real security check (see
`authentication.md`). Real enforcement happens in the admin layout above
and in every admin-gated API route.

## The submit → success screen flow

`/submit` doesn't navigate anywhere on success — `ComplaintSubmissionFlow`
(an organism, not a separate page) swaps its own rendered content from the
form to a success screen showing the `TrackingCodeDisplay`. The
"Continue" button is disabled until the person checks "I've saved my
tracking code" — this is intentional per the design spec, since the code
is never shown again after this screen.
