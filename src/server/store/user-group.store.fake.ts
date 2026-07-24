import type { UserGroupRecord } from "@/server/store/user-group.store";

let userGroups: UserGroupRecord[] = [];
let nextId = 1;

function isActive(userGroup: UserGroupRecord): boolean {
  return userGroup.status === 1;
}

export function resetForTests(): void {
  userGroups = [];
  nextId = 1;
}

export async function listUserGroups(): Promise<UserGroupRecord[]> {
  return userGroups.filter(isActive);
}

export async function getUserGroupById(id: number): Promise<UserGroupRecord | undefined> {
  const userGroup = userGroups.find((candidate) => candidate.id === id);
  return userGroup && isActive(userGroup) ? userGroup : undefined;
}

export async function findUserGroupByName(
  name: string,
  excludeId?: number,
): Promise<UserGroupRecord | undefined> {
  return userGroups.find(
    (userGroup) => isActive(userGroup) && userGroup.name === name && userGroup.id !== excludeId,
  );
}

export async function addUserGroup(
  record: { name: string },
  createdBy: string,
): Promise<UserGroupRecord> {
  const now = new Date().toISOString();
  const created: UserGroupRecord = {
    id: nextId++,
    name: record.name,
    status: 1,
    createdAt: now,
    updatedAt: now,
    createdBy,
    updatedBy: createdBy,
  };
  userGroups.push(created);
  return created;
}

export async function updateUserGroup(
  id: number,
  changes: { name: string },
  updatedBy: string,
): Promise<UserGroupRecord | undefined> {
  const index = userGroups.findIndex((userGroup) => userGroup.id === id);
  if (index === -1) return undefined;
  const updated: UserGroupRecord = {
    ...userGroups[index],
    name: changes.name,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  userGroups[index] = updated;
  return updated;
}

export async function setUserGroupActor(
  id: number,
  actorId: string,
): Promise<UserGroupRecord | undefined> {
  const index = userGroups.findIndex((userGroup) => userGroup.id === id);
  if (index === -1) return undefined;
  const updated: UserGroupRecord = {
    ...userGroups[index],
    createdBy: actorId,
    updatedBy: actorId,
  };
  userGroups[index] = updated;
  return updated;
}

export function makeDeleteUserGroup(
  isReferenced: (id: number) => boolean | Promise<boolean>,
  ReferencedError: new (id: number) => Error,
) {
  return async function deleteUserGroup(id: number, updatedBy: string): Promise<boolean> {
    const index = userGroups.findIndex((userGroup) => userGroup.id === id);
    if (index === -1) return false;

    if (await isReferenced(id)) {
      throw new ReferencedError(id);
    }

    userGroups[index] = {
      ...userGroups[index],
      status: 2,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    return true;
  };
}

export async function userGroupExists(id: number): Promise<boolean> {
  return (await getUserGroupById(id)) !== undefined;
}
