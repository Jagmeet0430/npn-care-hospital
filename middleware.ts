import { NextResponse, type NextRequest } from "next/server";

function applySecurityHeaders(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";

  const scriptPolicy = isProduction
    ? "'self' 'unsafe-inline'"
    : "'self' 'unsafe-inline' 'unsafe-eval' blob:";

  const stylePolicy = "'self' 'unsafe-inline'";

  // Allow the Supabase project used by the browser client.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  let supabaseOrigin = "";

  if (supabaseUrl) {
    try {
      supabaseOrigin = new URL(supabaseUrl).origin;
    } catch {
      supabaseOrigin = "";
    }
  }

  const connectSources = [
    "'self'",
    supabaseOrigin,
    ...(isProduction ? [] : ["ws:", "wss:"]),
  ]
    .filter(Boolean)
    .join(" ");

  const csp = [
    "default-src 'self'",
    `script-src ${scriptPolicy}`,
    `style-src ${stylePolicy}`,
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  response.headers.set("X-XSS-Protection", "0");

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthRoute = pathname.startsWith("/api/auth");
  const isApiRoute = pathname.startsWith("/api/");

  /*
   * NextAuth is no longer used to protect the admin pages.
   *
   * Admin authentication is handled by:
   *
   * app/admin/(protected)/layout.tsx
   *
   * using Supabase Auth.
   */

  if (isAuthRoute) {
    const response = NextResponse.next();

    applySecurityHeaders(response);
    response.headers.set("Cache-Control", "no-store");

    return response;
  }

  /*
   * API CORS
   *
   * Allow the current application origin.
   * Also allow localhost during development.
   */
  const origin = request.headers.get("origin");

  if (isApiRoute && origin) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      request.nextUrl.origin,
    ];

    if (!allowedOrigins.includes(origin)) {
      const response = NextResponse.json(
        {
          ok: false,
          message: "CORS origin not allowed.",
        },
        {
          status: 403,
        }
      );

      applySecurityHeaders(response);

      return response;
    }
  }

  /*
   * Do NOT perform the old NextAuth admin redirect here.
   *
   * Supabase authentication is handled by:
   *
   * app/admin/(protected)/layout.tsx
   */

  const response = NextResponse.next();

  applySecurityHeaders(response);

  if (isApiRoute) {
    response.headers.set("Cache-Control", "no-store");

    if (origin && origin === request.nextUrl.origin) {
      response.headers.set(
        "Access-Control-Allow-Origin",
        origin
      );

      response.headers.set(
        "Access-Control-Allow-Credentials",
        "true"
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};