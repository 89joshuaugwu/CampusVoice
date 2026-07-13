import { NextResponse, type NextRequest } from "next/server";

// This is a UX-level fast path only. It reads a client-set "cv_role" cookie
// (see lib/auth.ts) to bounce obviously-non-admin visitors away from
// /dashboard/admin/* before the page even renders. It is NOT the security
// boundary — a cookie can be forged, so every admin-only read/write is
// re-checked server-side against Firestore's /users/{uid}.role field
// (see lib/complaints.ts, lib/categories.ts, and the app/(dashboard)/dashboard/admin
// layout's client-side role check as a second line of defense).
export function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin");
  if (!isAdminRoute) return NextResponse.next();

  const role = req.cookies.get("cv_role")?.value;

  // No cookie at all (never logged in on this browser) — send to login.
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Logged in but cookie says student — send to the student dashboard home.
  // (A stale/forged cookie claiming "admin" is still re-checked by the
  // admin layout's client-side Firestore role lookup and by every API route.)
  if (role === "student") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/admin/:path*"],
};
