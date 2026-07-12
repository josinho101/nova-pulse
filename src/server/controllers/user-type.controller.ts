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
import { resolveActorNames } from "@/server/controllers/user.controller";
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
  createdBy?: string;
  updatedBy?: string;
  createdByName?: string;
  updatedByName?: string;
}

function withActorNames(userType: UserType, actorNameById: Map<string, string>): UserType {
  return {
    ...userType,
    createdByName: userType.createdBy ? actorNameById.get(userType.createdBy) : undefined,
    updatedByName: userType.updatedBy ? actorNameById.get(userType.updatedBy) : undefined,
  };
}

export async function listUserTypes(): Promise<ApiResult<UserType[]>> {
  const records = await listUserTypeRecords();
  const actorNameById = await resolveActorNames(
    records.flatMap((record) => [record.createdBy, record.updatedBy]),
  );
  return ok(records.map((record) => withActorNames(record, actorNameById)));
}

export async function getUserType(id: number): Promise<ApiResult<UserType>> {
  const userType = await getUserTypeById(id);
  if (!userType) return fail(404, "UserType not found");

  const actorNameById = await resolveActorNames([userType.createdBy, userType.updatedBy]);
  return ok(withActorNames(userType, actorNameById));
}

export async function createUserType(
  input: unknown,
  actorId: string,
): Promise<ApiResult<UserType>> {
  const parsed = userTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (await findUserTypeByName(parsed.data.name)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const created = await addUserType(parsed.data, actorId);
  const actorNameById = await resolveActorNames([created.createdBy, created.updatedBy]);
  return ok(withActorNames(created, actorNameById));
}

export async function updateUserType(
  id: number,
  input: unknown,
  actorId: string,
): Promise<ApiResult<UserType>> {
  if (!(await getUserTypeById(id))) return fail(404, "UserType not found");

  const parsed = userTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (await findUserTypeByName(parsed.data.name, id)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const updated = await updateUserTypeRecord(id, parsed.data, actorId);
  const actorNameById = await resolveActorNames([updated!.createdBy, updated!.updatedBy]);
  return ok(withActorNames(updated!, actorNameById));
}

export async function deleteUserType(id: number, actorId: string): Promise<ApiResult<null>> {
  if (!(await getUserTypeById(id))) return fail(404, "UserType not found");

  try {
    await deleteUserTypeRecord(id, actorId);
  } catch (error) {
    if (error instanceof UserTypeReferencedError) {
      return fail(409, "UserType is referenced by one or more users and cannot be deleted");
    }
    throw error;
  }

  return ok(null);
}
