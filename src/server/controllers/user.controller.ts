import { z } from "zod";
import {
  addUser,
  deleteUser as deleteUserRecord,
  findUserByEmail,
  getUserById,
  listUsers as listUserRecords,
  updateUser as updateUserRecord,
} from "@/server/store/user.store";
import {
  getUserTypeById,
  SUPER_ADMIN_USER_TYPE_ID,
  userTypeExists,
} from "@/server/store/user-type.store";
import type { RecordStatus } from "@/server/store/record-status";
import { ApiResult, fail, ok } from "@/server/http/api-response";
import { toFieldErrors } from "@/server/http/validation";

export const userInputSchema = z.object({
  firstName: z.string().trim().min(1, "firstName is required"),
  lastName: z.string().trim().min(1, "lastName is required"),
  middleName: z.string().trim().min(1).optional(),
  dob: z.iso.date("dob must be a valid ISO date (YYYY-MM-DD)"),
  address: z.string().trim().min(1).optional(),
  phone: z.string().trim().regex(/^[0-9]+$/, "phone must contain digits only").optional(),
  email: z.email("email must be a valid email address"),
  typeId: z.number().int("typeId must be an integer"),
});

export type UserInput = z.infer<typeof userInputSchema>;

export interface User extends Omit<UserInput, "dob" | "email"> {
  id: string;
  dob?: string;
  email?: string;
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

export async function listUsers(
  page: number = DEFAULT_PAGE,
  pageSize: number = DEFAULT_PAGE_SIZE,
  sortBy: UserSortField = DEFAULT_SORT_FIELD,
  sortOrder: "asc" | "desc" = "asc",
  search: string = "",
): Promise<ApiResult<PaginatedUsers>> {
  const safePage = Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const safeSortBy = USER_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_SORT_FIELD;

  const records = await listUserRecords(search.trim() || undefined);
  const userTypeNamePairs = await Promise.all(
    records.map(
      async (record) => [record.typeId, (await getUserTypeById(record.typeId))?.name ?? ""] as const,
    ),
  );
  const userTypeNameById = new Map(userTypeNamePairs);

  const compareBy = (user: User): string => {
    if (safeSortBy === "userType") return userTypeNameById.get(user.typeId) ?? "";
    return user[safeSortBy] ?? "";
  };

  const sorted = [...records].sort((a, b) => {
    const comparison = compareBy(a).localeCompare(compareBy(b));
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const start = (safePage - 1) * safePageSize;
  const items = sorted.slice(start, start + safePageSize);

  return ok({ items, page: safePage, pageSize: safePageSize, total: sorted.length });
}

export async function getUser(id: string): Promise<ApiResult<User>> {
  const user = await getUserById(id);
  if (!user) return fail(404, "User not found");
  return ok(user);
}

export async function createUser(input: unknown): Promise<ApiResult<User>> {
  const parsed = userInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (!(await userTypeExists(parsed.data.typeId))) {
    return fail(400, "Validation failed", [
      { path: "typeId", message: "Referenced UserType does not exist" },
    ]);
  }

  if (await findUserByEmail(parsed.data.email)) {
    return fail(409, "Conflict", [{ path: "email", message: "Email is already in use" }]);
  }

  const created = await addUser(parsed.data);
  return ok(created);
}

export async function updateUser(id: string, input: unknown): Promise<ApiResult<User>> {
  if (!(await getUserById(id))) return fail(404, "User not found");

  const parsed = userInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (!(await userTypeExists(parsed.data.typeId))) {
    return fail(400, "Validation failed", [
      { path: "typeId", message: "Referenced UserType does not exist" },
    ]);
  }

  if (await findUserByEmail(parsed.data.email, id)) {
    return fail(409, "Conflict", [{ path: "email", message: "Email is already in use" }]);
  }

  const updated = await updateUserRecord(id, parsed.data);
  return ok(updated!);
}

export async function deleteUser(id: string): Promise<ApiResult<null>> {
  const user = await getUserById(id);
  if (!user) return fail(404, "User not found");

  if (user.typeId === SUPER_ADMIN_USER_TYPE_ID) {
    return fail(403, "Super admin user cannot be deleted");
  }

  await deleteUserRecord(id);
  return ok(null);
}
