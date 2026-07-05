import { apiRequest, type ApiResult } from "@/lib/api-client";
import type { AuthenticatedUser } from "@/lib/auth-session";

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

const BASE_URL = "/api/v1/auth";

export function login(input: LoginInput): Promise<ApiResult<LoginResponse>> {
  return apiRequest<LoginResponse>(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
