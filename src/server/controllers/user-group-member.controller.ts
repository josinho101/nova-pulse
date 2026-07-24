import {
  addUserToGroup,
  findMembership,
  listGroupsForUser as listGroupsForUserStore,
  listMembersByGroup,
  removeUserFromGroup,
} from "@/server/store/user-group-member.store";
import { userGroupExists } from "@/server/store/user-group.store";
import { userExists } from "@/server/store/user.store";
import { ApiResult, fail, ok } from "@/server/http/api-response";

export interface UserGroupMember {
  userId: string;
  groupId: number;
  createdAt: string;
  createdBy?: string;
}

export async function listGroupMembers(groupId: number): Promise<ApiResult<UserGroupMember[]>> {
  if (!(await userGroupExists(groupId))) return fail(404, "UserGroup not found");

  const records = await listMembersByGroup(groupId);
  return ok(records);
}

export async function addGroupMember(
  groupId: number,
  userId: string,
  actorId: string,
): Promise<ApiResult<UserGroupMember>> {
  if (!(await userGroupExists(groupId))) return fail(404, "UserGroup not found");
  if (!(await userExists(userId))) return fail(404, "User not found");

  if (await findMembership(userId, groupId)) {
    return fail(409, "User is already in this group");
  }

  const created = await addUserToGroup(userId, groupId, actorId);
  return ok(created!);
}

export async function removeGroupMember(
  groupId: number,
  userId: string,
): Promise<ApiResult<null>> {
  if (!(await userGroupExists(groupId))) return fail(404, "UserGroup not found");
  if (!(await userExists(userId))) return fail(404, "User not found");

  if (!(await findMembership(userId, groupId))) {
    return fail(404, "User is not a member of this group");
  }

  await removeUserFromGroup(userId, groupId);
  return ok(null);
}

export async function listGroupsForUser(userId: string): Promise<ApiResult<UserGroupMember[]>> {
  if (!(await userExists(userId))) return fail(404, "User not found");

  const records = await listGroupsForUserStore(userId);
  return ok(records);
}

export async function setGroupsForUser(
  userId: string,
  groupIds: number[],
  actorId: string,
): Promise<ApiResult<UserGroupMember[]>> {
  if (!(await userExists(userId))) return fail(404, "User not found");

  for (const groupId of groupIds) {
    if (!(await userGroupExists(groupId))) return fail(404, `UserGroup ${groupId} not found`);
  }

  const current = await listGroupsForUserStore(userId);
  const currentGroupIds = new Set(current.map((member) => member.groupId));
  const desiredGroupIds = new Set(groupIds);

  for (const groupId of desiredGroupIds) {
    if (!currentGroupIds.has(groupId)) await addUserToGroup(userId, groupId, actorId);
  }
  for (const groupId of currentGroupIds) {
    if (!desiredGroupIds.has(groupId)) await removeUserFromGroup(userId, groupId);
  }

  const updated = await listGroupsForUserStore(userId);
  return ok(updated);
}
