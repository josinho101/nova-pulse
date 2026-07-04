import { z } from "zod";
import {
  addUserType,
  deleteUserType as deleteUserTypeRecord,
  findUserTypeByName,
  getUserTypeById,
  listUserTypes as listUserTypeRecords,
  updateUserType as updateUserTypeRecord,
  type UserTypeStatus,
} from "@/server/store/user-type.store";
import { isUserTypeReferenced } from "@/server/store/user.store";
import { ApiResult, fail, ok } from "@/server/http/api-response";

export const userTypeInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(20, "name must be at most 20 characters"),
});

export type UserTypeInput = z.infer<typeof userTypeInputSchema>;

export interface UserType extends UserTypeInput {
  id: number;
  status: UserTypeStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

function toFieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function listUserTypes(): ApiResult<UserType[]> {
  return ok(listUserTypeRecords());
}

export function getUserType(id: number): ApiResult<UserType> {
  const userType = getUserTypeById(id);
  if (!userType) return fail(404, "UserType not found");
  return ok(userType);
}

export function createUserType(input: unknown): ApiResult<UserType> {
  const parsed = userTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (findUserTypeByName(parsed.data.name)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const created = addUserType(parsed.data);
  return ok(created);
}

export function updateUserType(id: number, input: unknown): ApiResult<UserType> {
  if (!getUserTypeById(id)) return fail(404, "UserType not found");

  const parsed = userTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (findUserTypeByName(parsed.data.name, id)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const updated = updateUserTypeRecord(id, parsed.data);
  return ok(updated!);
}

export function deleteUserType(id: number): ApiResult<null> {
  if (!getUserTypeById(id)) return fail(404, "UserType not found");

  if (isUserTypeReferenced(id)) {
    return fail(409, "UserType is referenced by one or more users and cannot be deleted");
  }

  deleteUserTypeRecord(id);
  return ok(null);
}
