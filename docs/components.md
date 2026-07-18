# Components

Organized atomic-design style: `ui/` (atoms) → `molecules/` → `organisms/`
→ `shells/`. Rule of thumb: if it's used in more than one place or does
something non-trivial with data, it graduates from inline JSX to its own
file at the appropriate level.

---

## `components/ui/` — atoms

| Component | Purpose | Notes |
|---|---|---|
| `Button.tsx` | Primary/secondary/danger/ghost variants, loading state | Min 44px touch height everywhere per mobile spec |
| `Field.tsx` | `Input`, `Textarea`, `Select` | Shared 44px height, focus ring, error/hint text |
| `Card.tsx` | `Card`, `Spinner`, `Modal` | `Modal` is a bottom-sheet on mobile, centered dialog on desktop |
| `StatusBadge.tsx` | Pending/In Review/Resolved/Rejected pill | Always pairs an icon + text label — never color-alone, for accessibility |
| `CategoryTag.tsx` | Category chip | Applies the red-bordered treatment automatically for categories in `SENSITIVE_CATEGORIES` (`types/category.ts`) |
| `TrackingCodeDisplay.tsx` | Large mono-font code + copy button | Used exactly once, on the submission success screen |
| `Logo.tsx` | `LogoMark` (icon only) + `Logo` (icon + wordmark) | Inline SVG, not an `<img>` — crisp at any size, matches `app/icon.svg` favicon |
| `Toast.tsx` | `react-hot-toast` provider, brand-styled | Mounted once in `app/layout.tsx` |
| `AttachmentLightbox.tsx` | Full-screen in-app viewer for images/PDFs | See `attachments.md` |

---

## `components/molecules/` — composed from atoms

| Component | Purpose | Used in |
|---|---|---|
| `AnonymousToggle.tsx` | On/off switch + explanatory copy | `ComplaintForm` |
| `ComplaintForm.tsx` | Title/category/description/attachments/anonymous fields | `ComplaintSubmissionFlow` |
| `ComplaintCard.tsx` | Compact complaint summary, tap to view | My Complaints list, dashboard "Recent" |
| `ThreadMessage.tsx` | One chat bubble — admin left-aligned, complainant right-aligned | `ComplaintThreadView` |
| `ThreadReplyBox.tsx` | Sticky textarea + send button | `ComplaintThreadView` |
| `NotificationBell.tsx` | Real-time badge + dropdown | `AppShell` top bar |
| `AttachmentGrid.tsx` | Thumbnail grid → opens `AttachmentLightbox` | `ComplaintThreadView` |

### `ComplaintCard.tsx` — a specific gotcha worth knowing

Wraps a `<Link>` around a `flex` `Card`. `next/link` renders as a plain
`<a>`, which defaults to `display: inline` — if the `Link` itself has no
`className`, the `flex`/`min-w-0`/`truncate` chain inside has nothing real
to constrain against, and a long title can overflow the whole page width on
mobile instead of clipping. Current state: `className="block w-full
min-w-0"` on the `Link`, and the title itself uses `line-clamp-2
break-words` rather than a single-line `truncate` — wrapping is more
robust here since a wrapped line's minimum width is just its longest word,
so it can't blow out the layout even if something upstream isn't perfectly
constrained. **If you copy this pattern elsewhere (any new
`<Link><Card>...</Card></Link>`), carry both fixes with it.**

---

## `components/organisms/` — data-connected, page-level sections

| Component | Purpose | Used in |
|---|---|---|
| `ComplaintSubmissionFlow.tsx` | Form + gated success screen | `/submit` |
| `TrackingLookup.tsx` | Code input, routes to `/track/[code]` | `/track` |
| `ComplaintThreadView.tsx` | **The big reusable one** — full complaint detail + thread | `/track/[code]`, student detail, admin detail |
| `AdminQueueTable.tsx` | Filters + desktop table / mobile cards | `/dashboard/admin/queue` |
| `CategoryManager.tsx` | Add/edit/delete categories + delete-guard modal | `/dashboard/admin/categories` |
| `ReportsDashboard.tsx` | Metric cards + bar/donut/line charts + CSV/PDF export | `/dashboard/admin/reports` |

### `ComplaintThreadView.tsx` — the one component, three contexts

Takes an `authContext: "public" | "student" | "admin"` prop that changes
what renders:

- `internalNotes` textarea + status dropdown → only when `authContext === "admin"`
- Reply authorization → `public` sends `trackingCode` in the request body
  (no auth token), `student`/`admin` send an ID token instead
- Everything else (title, description, attachments, thread messages) is
  identical across all three — this is the DESIGN.md requirement that it's
  "the same component, different permission context," not three separate
  near-duplicate views.

---

## `components/shells/`

| Component | Purpose |
|---|---|
| `PublicShell.tsx` | Top bar (logo, Track link, Login/Dashboard) + mobile bottom nav (Home/Submit/Track/Login-or-Dashboard) |
| `AppShell.tsx` | Desktop sidebar (role-adaptive nav) / mobile bottom nav, top bar with `NotificationBell` + account menu |

Both render a **different bottom nav item set** depending on role
(`STUDENT_NAV` vs `ADMIN_NAV` in `AppShell.tsx`) — this is what makes the
sidebar/bottom-bar show Queue/Categories/Reports for admins and My
Complaints/Submit for students.
