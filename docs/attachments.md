# Attachments — Upload & Viewing

Covers the full path from "user taps to add a photo" to "admin views it" —
entirely inside the app, no external tabs.

## Upload — signed Cloudinary uploads

**Why signed, not an unsigned preset:** an unsigned upload preset would
need to be publicly embeddable in client code, which means anyone could POST
arbitrary files to your Cloudinary account from outside the app. Signed
uploads require a per-request signature generated server-side, so only
requests that actually went through CampusVoice's own backend can succeed.

1. Browser calls `POST /api/cloudinary/sign` (no auth required — anyone
   submitting a complaint, logged in or not, may attach a file)
2. `app/api/cloudinary/sign/route.ts` generates a timestamp + folder +
   HMAC signature using `cloudinary.utils.api_sign_request()` and the
   server-only `CLOUDINARY_API_SECRET`
3. Browser (`lib/cloudinary.ts` → `uploadAttachment()`) POSTs the actual
   file bytes **directly to Cloudinary's API**, along with that signature —
   the file never passes through a CampusVoice server
4. Cloudinary returns a `secure_url`, which gets pushed into the
   complaint's `attachments: string[]` array on submit

Files land in the `campusvoice/complaints` folder in Cloudinary. Max 3
attachments per complaint (enforced client-side in `ComplaintForm.tsx`).

## Viewing — in-app, never navigates away

Earlier versions used `<a href={url} target="_blank">`, which opened
Cloudinary's raw URL in a new browser tab — functional, but it took people
out of the app entirely. The current implementation stays fully in-app:

### `lib/attachments.ts`

Pure helper — `getAttachmentKind(url)` returns `"image" | "pdf" | "other"`
based on file extension, `getAttachmentLabel()` builds a display label
("Photo 1", "Document 1", "Attachment 1").

### `components/molecules/AttachmentGrid.tsx`

Renders thumbnails inline in the thread view:
- **Images** → actual `<img>` thumbnail (80×80, `object-cover`)
- **PDFs** → a document-icon card with the label
- **Other** → a generic paperclip-icon card

Clicking any thumbnail opens `AttachmentLightbox` at that index.

### `components/ui/AttachmentLightbox.tsx`

Full-screen overlay (`z-[60]`, above the page):
- **Images** render directly via `<img>`
- **PDFs** render in an embedded `<iframe>` — the PDF viewer itself is
  inside the page, not a separate tab
- **Other file types** show a "can't preview here" message with a
  **Download** link as the only exit — this is the one deliberate
  exception to "never leaves the site," since there's no way to preview
  an arbitrary file type in-browser, and downloading isn't the same as
  navigating away
- Prev/Next arrows when there's more than one attachment, plus arrow-key
  navigation
- Escape key or the X button closes it; body scroll is locked while open

## Adding a new attachment consumer

If you build another place that displays complaint attachments (e.g. a
future admin export view), reuse `<AttachmentGrid attachments={...} />`
rather than re-implementing links — that's the one place the
"stay in-app" behavior lives, and duplicating raw `<a href>` tags
elsewhere would silently reintroduce the external-tab problem this was
built to fix.
