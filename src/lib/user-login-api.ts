import { apiRequest, type ApiResult } from "@/lib/api-client";

export interface UserLoginSummary {
  id: string;
  username: string;
  forcePasswordChange: boolean;
}

export interface UserLoginInput {
  username: string;
  password?: string;
  forcePasswordChange: boolean;
}

const BASE_URL = "/api/v1/auth/user-login";

export function getUserLogin(
  userId: string,
  signal?: AbortSignal,
): Promise<ApiResult<UserLoginSummary | null>> {
  return apiRequest<UserLoginSummary | null>(`${BASE_URL}/${userId}`, { signal });
}

export function saveUserLogin(
  userId: string,
  input: UserLoginInput,
): Promise<ApiResult<UserLoginSummary>> {
  return apiRequest<UserLoginSummary>(`${BASE_URL}/${userId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function disableUserLogin(userId: string): Promise<ApiResult<null>> {
  return apiRequest<null>(`${BASE_URL}/${userId}`, { method: "DELETE" });
}
