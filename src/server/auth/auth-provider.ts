export interface AuthenticatedUser {
  id: string;
  username: string;
  forcePasswordChange: boolean;
}

export interface LoginResult {
  token: string;
  user: AuthenticatedUser;
}

export interface AuthProvider {
  login(username: string, password: string): Promise<LoginResult | undefined>;
  verifyToken(token: string): Promise<AuthenticatedUser | undefined>;
}
