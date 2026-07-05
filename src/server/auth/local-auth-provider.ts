import bcrypt from "bcrypt";
import type { AuthProvider, AuthenticatedUser, LoginResult } from "@/server/auth/auth-provider";
import { signToken, verifyJwt } from "@/server/auth/jwt";
import { findByUsername } from "@/server/store/user-login.store";
import { getUserById } from "@/server/store/user.store";
import { RECORD_STATUS } from "@/server/store/record-status";

export class LocalAuthProvider implements AuthProvider {
  async login(username: string, password: string): Promise<LoginResult | undefined> {
    const login = await findByUsername(username);
    if (!login) return undefined;

    const passwordMatches = await bcrypt.compare(password, login.passwordHash);
    if (!passwordMatches) return undefined;

    const user = await getUserById(login.userId);
    if (!user || user.status !== RECORD_STATUS.ACTIVE) return undefined;

    const authenticatedUser: AuthenticatedUser = {
      id: login.userId,
      username: login.username,
      forcePasswordChange: login.forcePasswordChange,
    };

    const token = await signToken(authenticatedUser);
    return { token, user: authenticatedUser };
  }

  async verifyToken(token: string): Promise<AuthenticatedUser | undefined> {
    return verifyJwt(token);
  }
}

export const authProvider: AuthProvider = new LocalAuthProvider();
