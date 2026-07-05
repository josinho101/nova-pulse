import { SignJWT, jwtVerify } from "jose";
import { authConfig } from "@/server/config/auth";
import type { AuthenticatedUser } from "@/server/auth/auth-provider";

const secretKey = Buffer.from(authConfig.jwtSecret, "utf-8");

export async function signToken(payload: AuthenticatedUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(authConfig.jwtExpiresIn)
    .sign(secretKey);
}

export async function verifyJwt(token: string): Promise<AuthenticatedUser | undefined> {
  try {
    const { payload } = await jwtVerify<AuthenticatedUser>(token, secretKey);
    return {
      id: payload.id,
      username: payload.username,
      forcePasswordChange: payload.forcePasswordChange,
    };
  } catch {
    return undefined;
  }
}
