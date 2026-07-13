# CampusVoice — Testing Guide

You've already got: 1 admin account, categories seeded. Before starting, create
**one more account** (a plain student, via `/auth/signup`) so you can test the
logged-in-student flow separately from admin. Keep 3 browser contexts handy:

| Context | How |
|---|---|
| Admin | your existing admin login |
| Student | new account, or a separate browser/incognito window |
| Anonymous | incognito window, never log in |

---

## 1. Sample complaint data (one per category)

Use these when the form asks for title/category/description — copy-paste ready.

| # | Category | Title | Description |
|---|---|---|---|
| 1 | Academic | Missing CA scores for CSC 415 Computer Graphics | I submitted my continuous assessment tests for CSC 415 but my scores are not reflecting on the portal. I wrote both tests in March 2026 but the portal still shows 0. Please investigate before the semester result is compiled. |
| 2 | Hostel/Accommodation | No water supply in Female Hostel Block B for 2 weeks | Block B female hostel has had no running water for the past two weeks. Students are forced to fetch water from the male hostel taps, which is inconveniencing and unsafe at night. Please look into fixing the pumping machine. |
| 3 | ICT/Portal | Cannot access course registration portal | Since Monday I've been unable to log into the student portal to complete my course registration for this semester. It shows an "Invalid session" error every time I try. |
| 4 | Harassment | Inappropriate comments from a lecturer during practical class | During a practical session, a lecturer made comments about a student's appearance that made the whole class uncomfortable. This needs to be addressed since it happened in front of everyone. |
| 5 | Financial | School fees payment not reflecting after 5 days | I paid my school fees via Remita five working days ago but my portal still shows "fees not paid." I have the payment receipt and a transaction reference number. |
| 6 | Facilities | Broken projector in New Lecture Theatre | The projector in the New Lecture Theatre has not worked for a week, forcing lecturers to cancel classes or improvise with a whiteboard. This is affecting several 400-level courses. |
| 7 | Other | Request for extension of library operating hours | With exams approaching, students would benefit from the library staying open until 10pm instead of 6pm, especially during the exam period. |

Complaint #4 (Harassment) is deliberately included so you can confirm the
**red left-border priority treatment** shows up for it in the admin queue —
none of the others should have it.

---

## 2. Auth

| Test | Steps | Expect |
|---|---|---|
| Student signup | `/auth/signup` → Full name: `Test Student`, Reg number: `2022030299999`, Email: `teststudent@esut.edu.ng`, Password: `test1234` | Redirects to `/dashboard`, shows student nav (Home / My Complaints / Submit) |
| Student login | Log out, log back in with the same email/password | Same dashboard, no admin links visible |
| Wrong password | Try logging in with a deliberately wrong password | Toast: "Incorrect email or password." — not a raw Firebase error |
| Admin login | Log in with your existing admin account | Sidebar shows Home / Queue / Categories / Reports (no "My Complaints") |
| Non-admin hits admin URL | While logged in as the student, manually type `/dashboard/admin/queue` in the address bar | Redirected to `/dashboard` with a toast: "Admin access only." |

---

## 3. Anonymous submission + tracking (no login anywhere)

1. In an incognito window, go to `/submit`.
2. Fill in sample #2 (Hostel/Accommodation water issue).
3. Confirm the **anonymous toggle is ON by default** since you're not logged in.
4. Submit → you should land on a success screen showing a tracking code like
   `CMP-2026-1234`.
5. Copy the code. Try clicking "Continue" — it should be **disabled** until
   you tick "I've saved my tracking code somewhere safe."
6. Open a **different** incognito window (simulating "days later, different
   device"), go to `/track`, paste the code.
7. Expect: status `Pending`, your title/category/description, no reply yet.
8. Type a reply in the thread box (e.g. `Any update on this?`) and send.
9. Refresh the page — the reply should still be there.

**Check it fails correctly too:** on `/track`, enter a made-up code like
`CMP-2026-9999`. Expect: "No complaint found for this code."

---

## 4. Logged-in student submission (non-anonymous)

1. Log in as your test student.
2. Go to `/submit`, fill sample #1 (Academic CA scores).
3. Turn the anonymous toggle **OFF**.
4. Submit, save the tracking code, continue.
5. Go to `/dashboard/my-complaints` — the complaint **should appear** here.
6. Open it, send a reply from the thread box.

## 5. Logged-in student, anonymous toggle ON — the edge case

This is the one worth testing carefully:

1. Still logged in as the student, go to `/submit` again.
2. Fill sample #3 (ICT/Portal).
3. This time turn the anonymous toggle **ON** (even though you're logged in).
4. Submit, save the code.
5. Go to `/dashboard/my-complaints` — this complaint should **NOT** appear
   there, even though you were logged in when you submitted it.
6. Confirm you can still reach it via `/track/<the code>` in the same or a
   different browser.

If it shows up in "My Complaints," that's a real bug — `studentId` should be
`null` on that record regardless of login state at submission time.

---

## 6. Admin queue & response flow

Log in as admin.

1. Go to **Queue** (`/dashboard/admin/queue`). All complaints submitted above
   should be listed.
2. Confirm complaint #4 (Harassment) has a **red left border** — desktop
   table row and mobile card view both.
3. Confirm every **anonymous** complaint shows a small "eye-off" icon next to
   the title in the queue.
4. Filter by status tabs (Pending / In Review / Resolved / Rejected) — list
   should update. Filter by category dropdown — same.
5. Open one complaint. Confirm:
   - If it's anonymous, you see a clear **"Anonymous submission"** label —
     no name anywhere.
   - You can change status via the dropdown (try Pending → In Review).
   - There's an **Internal notes** box (amber background) — type something
     like `Escalating to Facilities team` and save it.
6. Reply to the thread as admin (e.g. `We've logged this and assigned it to
   the relevant department.`).
7. Go back to that complaint via `/track/<code>` (anonymous) or
   `/dashboard/my-complaints/<id>` (student, if non-anonymous) — confirm:
   - Your admin reply is visible.
   - The new status is visible.
   - **Internal notes are NOT visible anywhere on this view.**

### Confirming internal notes never leak (do this one properly)

1. Open browser DevTools → **Network** tab on the `/track/<code>` page.
2. Reload / re-look-up the complaint.
3. Click the `track` request → **Response** tab.
4. Search the raw JSON for `internalNotes`. It should be **completely
   absent** from the response body — not present-but-empty, not hidden by
   CSS. If you see the field at all (even as `""`), that's a real bug.

---

## 7. Notifications

1. As admin, reply to or change the status of a complaint that belongs to
   your **logged-in** test student (not an anonymous one — anonymous
   complainants can't be notified, there's no account to notify).
2. Switch to the student's session. Within a few seconds, the bell icon
   (top right) should show a red unread badge.
3. Click the bell — dropdown shows the new-response / status-change message.
4. Click the notification — it should navigate to that complaint and mark it
   read (badge count drops).

---

## 8. Categories

1. Go to **Categories** as admin. You should see your 7 seeded categories,
   each showing a complaint count that reflects what you submitted above.
2. Try **adding** a new category, e.g. `Transport`.
3. Try **editing** a category name, e.g. rename `Other` → `Miscellaneous`
   (rename it back after, since sample data above references "Other").
4. Try **deleting** a category that has 0 complaints (e.g. your new
   `Transport` one) — should succeed.
5. Try **deleting** a category that has complaints (e.g. `Academic`) —
   should be **blocked** with a message stating how many complaints
   reference it.

---

## 9. Reports

1. Go to **Reports** as admin.
2. Confirm the three metric cards (Total, Resolved this month, Avg
   resolution time) show non-zero numbers reflecting your test data.
3. Confirm the bar chart (by category), donut chart (by status), and line
   chart (volume trend) all render with your 7 test complaints represented.
4. Click **Export CSV** — a file should download; open it and confirm the
   numbers match what's on screen.
5. Click **Export PDF** — this opens the browser print dialog; choose "Save
   as PDF" to confirm it works (this is a print-to-PDF, not a server-generated
   file, so no extra service is needed).

---

## 10. Mobile pass

Resize your browser to ~375px wide (or use DevTools device toolbar, iPhone SE
size) and repeat a quick pass of:

- Landing page — hero, "how it works," category chips all readable, no
  horizontal scroll
- Submit form — full-width inputs, attachment button tappable
- Admin queue — should switch from a table to **stacked cards**
- Thread view — reply box should stay **stuck to the bottom** above the
  keyboard when you tap into it
- Bottom tab bar — present on both public pages and dashboard, current page
  highlighted

---

## Quick reference — what "correct" looks like at a glance

| Behavior | Correct |
|---|---|
| Anonymous complaint in Firestore | `studentId: null`, regardless of login state at submission |
| Public tracking response | Never contains `internalNotes` |
| Non-admin visiting `/dashboard/admin/*` | Redirected + toasted, not a blank/broken page |
| Category with complaints | Delete blocked, clear message shown |
| Harassment category in queue | Red left border, both desktop and mobile |
| Anonymous complainant | Never notified (no bell activity) — only logged-in students are |
