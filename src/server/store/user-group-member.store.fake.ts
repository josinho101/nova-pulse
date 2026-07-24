import type { UserGroupMemberRecord } from "@/server/store/user-group-member.store";

let members: UserGroupMemberRecord[] = [];
let nextId = 1;

export function resetForTests(): void {
  members = [];
  nextId = 1;
}

export async function listMembersByGroup(groupId: number): Promise<UserGroupMemberRecord[]> {
  return members.filter((member) => member.groupId === groupId);
}

export async function listGroupsForUser(userId: string): Promise<UserGroupMemberRecord[]> {
  return members.filter((member) => member.userId === userId);
}

export async function findMembership(
  userId: string,
  groupId: number,
): Promise<UserGroupMemberRecord | undefined> {
  return members.find((member) => member.userId === userId && member.groupId === groupId);
}

export async function addUserToGroup(
  userId: string,
  groupId: number,
  createdBy: string,
): Promise<UserGroupMemberRecord | undefined> {
  if (await findMembership(userId, groupId)) return undefined;

  const created: UserGroupMemberRecord = {
    id: nextId++,
    userId,
    groupId,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  members.push(created);
  return created;
}

export async function removeUserFromGroup(userId: string, groupId: number): Promise<void> {
  members = members.filter((member) => !(member.userId === userId && member.groupId === groupId));
}

export async function isUserGroupReferenced(groupId: number): Promise<boolean> {
  return members.some((member) => member.groupId === groupId);
}
