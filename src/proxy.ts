import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/server/auth/jwt";

const BEARER_PREFIX = "Bearer ";

const PUBLIC_PATHS = ["/api/v1/health", "/api/v1/swagger", "/api/v1/auth/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length).trim() : undefined;
  const user = token ? await verifyJwt(token) : undefined;

  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/v1/:path*",
};
