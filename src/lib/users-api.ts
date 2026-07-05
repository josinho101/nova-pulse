import { apiRequest, type ApiResult } from "@/lib/api-client";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  address?: string;
  phone?: string;
  email: string;
  typeId: number;
  status: 1 | 2;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  address?: string;
  phone?: string;
  email: string;
  typeId: number;
}

export interface PaginatedUsers {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
}

export type UserSortField =
  | "firstName"
  | "lastName"
  | "email"
  | "userType"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
  | "updatedBy";

const BASE_URL = "/api/v1/users";

export function listUsers(
  page: number = 1,
  pageSize: number = 10,
  sortBy: UserSortField = "lastName",
  sortOrder: "asc" | "desc" = "asc",
  search: string = "",
  signal?: AbortSignal,
): Promise<ApiResult<PaginatedUsers>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortOrder,
  });
  if (search.trim()) params.set("search", search.trim());
  return apiRequest<PaginatedUsers>(`${BASE_URL}?${params.toString()}`, { signal });
}

export function getUser(id: string, signal?: AbortSignal): Promise<ApiResult<User>> {
  return apiRequest<User>(`${BASE_URL}/${id}`, { signal });
}

export function createUser(input: UserInput): Promise<ApiResult<User>> {
  return apiRequest<User>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateUser(id: string, input: UserInput): Promise<ApiResult<User>> {
  return apiRequest<User>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteUser(id: string): Promise<ApiResult<null>> {
  return apiRequest<null>(`${BASE_URL}/${id}`, { method: "DELETE" });
}
