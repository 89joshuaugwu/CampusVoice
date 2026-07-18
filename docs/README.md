# CampusVoice — Documentation

Live: https://campusv.vercel.app
Repo: https://github.com/89joshuaugwu/CampusVoice

This `docs/` folder is the reference set for how CampusVoice is built. Each
file covers one concern — read whichever matches what you're touching.

| File | Covers |
|---|---|
| [`architecture.md`](./architecture.md) | High-level system design, tech stack, why the pieces fit together the way they do |
| [`authentication.md`](./authentication.md) | Firebase Auth setup, roles, admin bootstrap, the `cv_role` cookie, route guards |
| [`database.md`](./database.md) | Firestore collections, field-by-field schema, security rules, indexes |
| [`api.md`](./api.md) | Every `/api/*` route — method, auth requirement, request/response shape |
| [`pages.md`](./pages.md) | Every page/route in the app, what it does, who can access it |
| [`components.md`](./components.md) | Component inventory (atoms/molecules/organisms/shells) and where each is used |
| [`attachments.md`](./attachments.md) | Cloudinary signed uploads + the in-app lightbox viewer |
| [`deployment.md`](./deployment.md) | Vercel + Firebase deploy steps, env vars, manual publish steps |
| [`../TESTING.md`](../TESTING.md) | Sample test data and step-by-step test cases (already in project root) |
| [`../README.md`](../README.md) | Quick-start setup (already in project root) |

## One-paragraph summary

CampusVoice is a student complaint system for ESUT with two roles (student,
admin) and one core design constraint: **anonymous submissions must be
structurally anonymous**, not just UI-hidden. That constraint is why
`/complaints` is entirely locked in Firestore rules and every read/write
goes through a server API route using `firebase-admin` instead of direct
client Firestore calls — see `database.md` Section 3 for the full reasoning.
