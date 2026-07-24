import { z } from "zod";
import {
  addUserGroup,
  deleteUserGroup as deleteUserGroupRecord,
  findUserGroupByName,
  getUserGroupById,
  listUserGroups as listUserGroupRecords,
  updateUserGroup as updateUserGroupRecord,
  UserGroupReferencedError,
  type UserGroupStatus,
} from "@/server/store/user-group.store";
import { resolveActorNames } from "@/server/controllers/user.controller";
import { ApiResult, fail, ok } from "@/server/http/api-response";
import { toFieldErrors } from "@/server/http/validation";

export const userGroupInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(20, "name must be at most 20 characters"),
});

export type UserGroupInput = z.infer<typeof userGroupInputSchema>;

export interface UserGroup extends UserGroupInput {
  id: number;
  status: UserGroupStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  createdByName?: string;
  updatedByName?: string;
}

function withActorNames(userGroup: UserGroup, actorNameById: Map<string, string>): UserGroup {
  return {
    ...userGroup,
    createdByName: userGroup.createdBy ? actorNameById.get(userGroup.createdBy) : undefined,
    updatedByName: userGroup.updatedBy ? actorNameById.get(userGroup.updatedBy) : undefined,
  };
}

export async function listUserGroups(): Promise<ApiResult<UserGroup[]>> {
  const records = await listUserGroupRecords();
  const actorNameById = await resolveActorNames(
    records.flatMap((record) => [record.createdBy, record.updatedBy]),
  );
  return ok(records.map((record) => withActorNames(record, actorNameById)));
}

export async function getUserGroup(id: number): Promise<ApiResult<UserGroup>> {
  const userGroup = await getUserGroupById(id);
  if (!userGroup) return fail(404, "UserGroup not found");

  const actorNameById = await resolveActorNames([userGroup.createdBy, userGroup.updatedBy]);
  return ok(withActorNames(userGroup, actorNameById));
}

export async function createUserGroup(
  input: unknown,
  actorId: string,
): Promise<ApiResult<UserGroup>> {
  const parsed = userGroupInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (await findUserGroupByName(parsed.data.name)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const created = await addUserGroup(parsed.data, actorId);
  const actorNameById = await resolveActorNames([created.createdBy, created.updatedBy]);
  return ok(withActorNames(created, actorNameById));
}

export async function updateUserGroup(
  id: number,
  input: unknown,
  actorId: string,
): Promise<ApiResult<UserGroup>> {
  if (!(await getUserGroupById(id))) return fail(404, "UserGroup not found");

  const parsed = userGroupInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (await findUserGroupByName(parsed.data.name, id)) {
    return fail(409, "Conflict", [{ path: "name", message: "Name is already in use" }]);
  }

  const updated = await updateUserGroupRecord(id, parsed.data, actorId);
  const actorNameById = await resolveActorNames([updated!.createdBy, updated!.updatedBy]);
  return ok(withActorNames(updated!, actorNameById));
}

export async function deleteUserGroup(id: number, actorId: string): Promise<ApiResult<null>> {
  if (!(await getUserGroupById(id))) return fail(404, "UserGroup not found");

  try {
    await deleteUserGroupRecord(id, actorId);
  } catch (error) {
    if (error instanceof UserGroupReferencedError) {
      return fail(409, "UserGroup is referenced by one or more members and cannot be deleted");
    }
    throw error;
  }

  return ok(null);
}
