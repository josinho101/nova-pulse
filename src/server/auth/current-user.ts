import type { NextRequest } from "next/server";
import { authProvider } from "@/server/auth/local-auth-provider";
import type { AuthenticatedUser } from "@/server/auth/auth-provider";

const BEARER_PREFIX = "Bearer ";

export async function getCurrentUser(
  request: NextRequest,
): Promise<AuthenticatedUser | undefined> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith(BEARER_PREFIX)) return undefined;

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) return undefined;

  return authProvider.verifyToken(token);
}
