import { apiRequest, type ApiResult } from "@/lib/api-client";

export interface UserType {
  id: number;
  name: string;
  status: 1 | 2;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserTypeInput {
  name: string;
}

const BASE_URL = "/api/v1/user-types";

export function listUserTypes(signal?: AbortSignal): Promise<ApiResult<UserType[]>> {
  return apiRequest<UserType[]>(BASE_URL, { signal });
}

export function createUserType(input: UserTypeInput): Promise<ApiResult<UserType>> {
  return apiRequest<UserType>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateUserType(id: number, input: UserTypeInput): Promise<ApiResult<UserType>> {
  return apiRequest<UserType>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteUserType(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`${BASE_URL}/${id}`, { method: "DELETE" });
}
