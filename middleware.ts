import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (request.cookies.get("automega_demo_admin")?.value === "active") return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = { matcher: ["/admin/:path*"] };
