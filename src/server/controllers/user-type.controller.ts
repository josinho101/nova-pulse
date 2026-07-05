import { z } from "zod";
import {
  addUserType,
  deleteUserType as deleteUserTypeRecord,
  findUserTypeByName,
  getUserTypeById,
  listUserTypes as listUserTypeRecords,
  updateUserType as updateUserTypeRecord,
  UserTypeReferencedError,
  type UserTypeStatus,
} from "@/server/store/user-type.store";
import { ApiResult, fail, ok } from "@/server/http/api-response";
import { toFieldErrors } from "@/server/http/validation";

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

export async function listUserTypes(): Promise<ApiResult<UserType[]>> {
  return ok(await listUserTypeRecords());
}

export async function getUserType(id: number): Promise<ApiResult<UserType>> {
  const userType = await getUserTypeById(id);
  if (!userType) return fail(404, "UserType not found");
  return ok(userType);
}

export async function createUserType(input: unknown): Promise<ApiResult<UserType>> {
  const parsed = userTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (await findUserTypeByName(parsed.data.name)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const created = await addUserType(parsed.data);
  return ok(created);
}

export async function updateUserType(id: number, input: unknown): Promise<ApiResult<UserType>> {
  if (!(await getUserTypeById(id))) return fail(404, "UserType not found");

  const parsed = userTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (await findUserTypeByName(parsed.data.name, id)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const updated = await updateUserTypeRecord(id, parsed.data);
  return ok(updated!);
}

export async function deleteUserType(id: number): Promise<ApiResult<null>> {
  if (!(await getUserTypeById(id))) return fail(404, "UserType not found");

  try {
    await deleteUserTypeRecord(id);
  } catch (error) {
    if (error instanceof UserTypeReferencedError) {
      return fail(409, "UserType is referenced by one or more users and cannot be deleted");
    }
    throw error;
  }

  return ok(null);
}
