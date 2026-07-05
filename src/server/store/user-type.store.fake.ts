import type { UserTypeRecord } from "@/server/store/user-type.store";

let userTypes: UserTypeRecord[] = [];
let nextId = 1;

function isActive(userType: UserTypeRecord): boolean {
  return userType.status === 1;
}

export function resetForTests(): void {
  userTypes = [];
  nextId = 1;
}

export async function listUserTypes(): Promise<UserTypeRecord[]> {
  return userTypes.filter(isActive);
}

export async function getUserTypeById(id: number): Promise<UserTypeRecord | undefined> {
  const userType = userTypes.find((candidate) => candidate.id === id);
  return userType && isActive(userType) ? userType : undefined;
}

export async function findUserTypeByName(
  name: string,
  excludeId?: number,
): Promise<UserTypeRecord | undefined> {
  return userTypes.find(
    (userType) => isActive(userType) && userType.name === name && userType.id !== excludeId,
  );
}

export async function addUserType(record: { name: string }): Promise<UserTypeRecord> {
  const now = new Date().toISOString();
  const created: UserTypeRecord = {
    id: nextId++,
    name: record.name,
    status: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: "system",
    updatedBy: "system",
  };
  userTypes.push(created);
  return created;
}

export async function updateUserType(
  id: number,
  changes: { name: string },
): Promise<UserTypeRecord | undefined> {
  const index = userTypes.findIndex((userType) => userType.id === id);
  if (index === -1) return undefined;
  const updated: UserTypeRecord = {
    ...userTypes[index],
    name: changes.name,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  userTypes[index] = updated;
  return updated;
}

export function makeDeleteUserType(
  isReferenced: (id: number) => boolean | Promise<boolean>,
  ReferencedError: new (id: number) => Error,
) {
  return async function deleteUserType(id: number): Promise<boolean> {
    const index = userTypes.findIndex((userType) => userType.id === id);
    if (index === -1) return false;

    if (await isReferenced(id)) {
      throw new ReferencedError(id);
    }

    userTypes[index] = {
      ...userTypes[index],
      status: 2,
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    };
    return true;
  };
}

export async function userTypeExists(id: number): Promise<boolean> {
  return (await getUserTypeById(id)) !== undefined;
}
