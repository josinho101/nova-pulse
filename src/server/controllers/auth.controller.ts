import { z } from "zod";
import { authProvider } from "@/server/auth/local-auth-provider";
import { ApiResult, fail, ok } from "@/server/http/api-response";
import { toFieldErrors } from "@/server/http/validation";

export const loginInputSchema = z.object({
  username: z.string().trim().min(1, "username is required"),
  password: z.string().min(1, "password is required"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    forcePasswordChange: boolean;
  };
}

export async function login(input: unknown): Promise<ApiResult<LoginResponse>> {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  const result = await authProvider.login(parsed.data.username, parsed.data.password);
  if (!result) {
    return fail(401, "Invalid username or password");
  }

  return ok(result);
}
