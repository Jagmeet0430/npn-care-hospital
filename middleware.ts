import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasPermission, isRole } from "@/lib/rbac";

function applySecurityHeaders(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";
  const scriptPolicy = isProduction ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval' blob:";
  const stylePolicy = "'self' 'unsafe-inline'";
  const csp = [
    "default-src 'self'",
    `script-src ${scriptPolicy}`,
    `style-src ${stylePolicy}`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set("X-XSS-Protection", "0");

  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";
  const isApiRoute = pathname.startsWith("/api/");
  const origin = request.headers.get("origin");

  if (isApiRoute && origin && origin !== request.nextUrl.origin) {
    const response = NextResponse.json({ ok: false, message: "CORS origin not allowed." }, { status: 403 });
    applySecurityHeaders(response);
    return response;
  }
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "npn-local-nextauth-secret-change-before-production"
  });
  const role = isRole(token?.role) ? token.role : undefined;
  const canAccessAdmin = hasPermission(role, "admin:access");

  if (isAdminPage && !isAdminLogin && !canAccessAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    const response = NextResponse.redirect(loginUrl);
    applySecurityHeaders(response);
    return response;
  }

  if (isAdminLogin && canAccessAdmin) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    const response = NextResponse.redirect(adminUrl);
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next();

  applySecurityHeaders(response);

  if (isApiRoute) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Access-Control-Allow-Origin", request.nextUrl.origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"]
};
