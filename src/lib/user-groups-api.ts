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

export interface UserGroupMember {
  userId: string;
  groupId: number;
  createdAt: string;
  createdBy?: string;
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

export function getGroupsForUser(
  userId: string,
  signal?: AbortSignal,
): Promise<ApiResult<UserGroupMember[]>> {
  return apiRequest<UserGroupMember[]>(`/api/v1/users/${userId}/groups`, { signal });
}

export function setGroupsForUser(
  userId: string,
  groupIds: number[],
): Promise<ApiResult<UserGroupMember[]>> {
  return apiRequest<UserGroupMember[]>(`/api/v1/users/${userId}/groups`, {
    method: "PUT",
    body: JSON.stringify({ groupIds }),
  });
}
