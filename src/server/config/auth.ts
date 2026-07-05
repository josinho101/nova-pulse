export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export const authConfig: AuthConfig = {
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
};
