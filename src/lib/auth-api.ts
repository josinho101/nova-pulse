import type { ApiFieldError, ApiResult } from "@/lib/api-client";
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

export async function login(input: LoginInput): Promise<ApiResult<LoginResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: json?.error?.message ?? "Request failed",
        fields: json?.error?.fields as ApiFieldError[] | undefined,
      };
    }

    return { ok: true, data: json?.data as LoginResponse };
  } catch {
    return { ok: false, status: 0, message: "Network error" };
  }
}
