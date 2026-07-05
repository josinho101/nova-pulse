import { z } from "zod";
import {
  addUser,
  deleteUser as deleteUserRecord,
  findUserByEmail,
  getUserById,
  listUsers as listUserRecords,
  updateUser as updateUserRecord,
} from "@/server/store/user.store";
import { getUserTypeById, userTypeExists } from "@/server/store/user-type.store";
import type { RecordStatus } from "@/server/store/record-status";
import { ApiResult, fail, ok } from "@/server/http/api-response";

export const userInputSchema = z.object({
  firstName: z.string().trim().min(1, "firstName is required"),
  lastName: z.string().trim().min(1, "lastName is required"),
  middleName: z.string().trim().min(1).optional(),
  dob: z.iso.date("dob must be a valid ISO date (YYYY-MM-DD)"),
  address: z.string().trim().min(1, "address is required"),
  email: z.email("email must be a valid email address"),
  typeId: z.number().int("typeId must be an integer"),
});

export type UserInput = z.infer<typeof userInputSchema>;

export interface User extends UserInput {
  id: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PaginatedUsers {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export type UserSortField =
  | "firstName"
  | "lastName"
  | "email"
  | "userType"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
  | "updatedBy";

const USER_SORT_FIELDS: UserSortField[] = [
  "firstName",
  "lastName",
  "email",
  "userType",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
];

const DEFAULT_SORT_FIELD: UserSortField = "lastName";

function toFieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function listUsers(
  page: number = DEFAULT_PAGE,
  pageSize: number = DEFAULT_PAGE_SIZE,
  sortBy: UserSortField = DEFAULT_SORT_FIELD,
  sortOrder: "asc" | "desc" = "asc",
): ApiResult<PaginatedUsers> {
  const safePage = Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const safeSortBy = USER_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_SORT_FIELD;

  const records = listUserRecords();
  const userTypeNameById = new Map(
    records.map((record) => [record.typeId, getUserTypeById(record.typeId)?.name ?? ""]),
  );

  const compareBy = (user: User): string => {
    if (safeSortBy === "userType") return userTypeNameById.get(user.typeId) ?? "";
    return user[safeSortBy];
  };

  const sorted = [...records].sort((a, b) => {
    const comparison = compareBy(a).localeCompare(compareBy(b));
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const start = (safePage - 1) * safePageSize;
  const items = sorted.slice(start, start + safePageSize);

  return ok({ items, page: safePage, pageSize: safePageSize, total: sorted.length });
}

export function getUser(id: string): ApiResult<User> {
  const user = getUserById(id);
  if (!user) return fail(404, "User not found");
  return ok(user);
}

export function createUser(input: unknown): ApiResult<User> {
  const parsed = userInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (!userTypeExists(parsed.data.typeId)) {
    return fail(400, "Validation failed", [
      { path: "typeId", message: "Referenced UserType does not exist" },
    ]);
  }

  if (findUserByEmail(parsed.data.email)) {
    return fail(409, "Conflict", [{ path: "email", message: "Email is already in use" }]);
  }

  const created = addUser(parsed.data);
  return ok(created);
}

export function updateUser(id: string, input: unknown): ApiResult<User> {
  if (!getUserById(id)) return fail(404, "User not found");

  const parsed = userInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (!userTypeExists(parsed.data.typeId)) {
    return fail(400, "Validation failed", [
      { path: "typeId", message: "Referenced UserType does not exist" },
    ]);
  }

  if (findUserByEmail(parsed.data.email, id)) {
    return fail(409, "Conflict", [{ path: "email", message: "Email is already in use" }]);
  }

  const updated = updateUserRecord(id, parsed.data);
  return ok(updated!);
}

export function deleteUser(id: string): ApiResult<null> {
  if (!getUserById(id)) return fail(404, "User not found");
  deleteUserRecord(id);
  return ok(null);
}
