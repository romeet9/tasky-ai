import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // "/invite" is public so an invited user can open the link before signing in;
  // the invite page handles sign-in itself, then accepts the invite.
  const publicRoutes = ["/", "/login", "/signup", "/api/auth", "/invite", "/preview", "/demo", "/debug", "/about", "/terms", "/refund", "/contact"];
  const isPublic = publicRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });

  if (isPublic) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;

  // Admin routes require authentication
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Note: Admin role check happens client-side in the AdminLayout component
    // because Firebase Admin SDK is not supported in Edge Runtime
    return NextResponse.next();
  }

  // Regular routes - just check for session
  if (!session && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|manifest.json|sw.js|icons|ascii-art.mp4|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.mp4|.*\\.woff2|.*\\.woff|.*\\.ttf).*)",
  ],
};