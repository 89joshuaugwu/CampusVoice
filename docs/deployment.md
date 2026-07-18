# Deployment

**Live:** https://campusv.vercel.app
**Repo:** https://github.com/89joshuaugwu/CampusVoice

## Current setup

Deployed on Vercel, connected to the GitHub repo above — pushes to the
default branch trigger a redeploy automatically. Firebase project provides
Auth + Firestore; Cloudinary provides file storage. Both are configured via
environment variables in Vercel's Project Settings, not committed to the
repo (see `.env.local.example` for the full list of keys).

## Environment variables (Vercel → Project Settings → Environment Variables)

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

NEXT_PUBLIC_APP_URL=https://campusv.vercel.app
```

**`FIREBASE_ADMIN_PRIVATE_KEY` gotcha:** paste it into Vercel with the
literal `\n` sequences intact — don't try to convert them to real newlines
in the Vercel UI. `lib/firebase-admin.ts` already handles the conversion at
runtime:

```ts
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
```

## Firebase-side deploy steps (separate from Vercel)

Vercel deploys the Next.js app; it does **not** push Firestore rules,
indexes, or Realtime Database rules — those are deployed independently via
the Firebase CLI:

```bash
npm i -g firebase-tools   # once
firebase login
firebase use --add        # pick the project, first time only
firebase deploy --only firestore:rules,firestore:indexes,database
```

Or manually per Firebase Console:
- **Firestore Database → Rules** → paste `firestore.rules` → **Publish**
- **Realtime Database → Rules** → paste `database.rules.json` → **Publish**
- Firestore composite indexes (`firestore.indexes.json`) will also
  auto-prompt via a console link the first time an unindexed query runs, if
  you skip the CLI deploy.

⚠️ These are **not automatic on every push** — if `firestore.rules` changes
in a future commit, remember to redeploy rules separately, or the old rules
stay live even though the code deployed fine.

## Bootstrapping the first admin (one-time, per environment)

No self-service admin signup exists by design. To promote an account:

1. Sign up normally via `/auth/signup` on the live site
2. Firebase Console → Firestore Database → `users/{uid}` → change `role`
   from `"student"` to `"admin"`
3. Log out and back in on the site (role is read live via `onSnapshot`,
   but a fresh login reliably clears any stale route-guard state)

## Seeding default categories (optional, one-time)

```bash
# place a Firebase service account JSON locally (never commit it)
node scripts/seed-categories.mjs
```

Populates the 7 default categories so the admin Categories page and Submit
form dropdown aren't empty before the first real complaint comes in.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

## Pre-deploy checklist for any future change

- [ ] `npx tsc --noEmit` — no type errors
- [ ] `npm run build` — full production build succeeds
- [ ] If `firestore.rules` or `firestore.indexes.json` changed — redeploy
      those separately via the Firebase CLI (Vercel won't do this)
- [ ] Run through `TESTING.md`'s end-to-end checklist, especially the
      anonymous-complaint flow and the `internalNotes` leak check
