import { apiRequest, type ApiResult } from "@/lib/api-client";

export interface UserGroup {
  id: number;
  name: string;
  status: 1 | 2;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  createdByName?: string;
  updatedByName?: string;
}

export interface UserGroupInput {
  name: string;
}

const BASE_URL = "/api/v1/user-groups";

export function listUserGroups(signal?: AbortSignal): Promise<ApiResult<UserGroup[]>> {
  return apiRequest<UserGroup[]>(BASE_URL, { signal });
}

export function createUserGroup(input: UserGroupInput): Promise<ApiResult<UserGroup>> {
  return apiRequest<UserGroup>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateUserGroup(id: number, input: UserGroupInput): Promise<ApiResult<UserGroup>> {
  return apiRequest<UserGroup>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteUserGroup(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`${BASE_URL}/${id}`, { method: "DELETE" });
}
