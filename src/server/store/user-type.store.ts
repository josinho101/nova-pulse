export const USER_TYPE_STATUS = { ACTIVE: 1, DELETED: 2 } as const;
export type UserTypeStatus = (typeof USER_TYPE_STATUS)[keyof typeof USER_TYPE_STATUS];

export interface UserTypeRecord {
  id: number;
  name: string;
  status: UserTypeStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

let userTypes: UserTypeRecord[] = [];
let nextUserTypeId = 1;

function isActive(userType: UserTypeRecord): boolean {
  return userType.status === USER_TYPE_STATUS.ACTIVE;
}

export function listUserTypes(): UserTypeRecord[] {
  return userTypes.filter(isActive);
}

export function getUserTypeById(id: number): UserTypeRecord | undefined {
  const userType = userTypes.find((candidate) => candidate.id === id);
  return userType && isActive(userType) ? userType : undefined;
}

export function findUserTypeByName(name: string, excludeId?: number): UserTypeRecord | undefined {
  return userTypes.find(
    (userType) => isActive(userType) && userType.name === name && userType.id !== excludeId,
  );
}

export function addUserType(record: { name: string }): UserTypeRecord {
  const now = new Date().toISOString();
  const created: UserTypeRecord = {
    id: nextUserTypeId++,
    name: record.name,
    status: USER_TYPE_STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
    createdBy: "system",
    updatedBy: "system",
  };
  userTypes.push(created);
  return created;
}

export function updateUserType(id: number, changes: { name: string }): UserTypeRecord | undefined {
  const existing = getUserTypeById(id);
  if (!existing) return undefined;

  const index = userTypes.findIndex((userType) => userType.id === id);
  const updated: UserTypeRecord = {
    ...existing,
    name: changes.name,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  userTypes[index] = updated;
  return updated;
}

export function deleteUserType(id: number): boolean {
  const existing = getUserTypeById(id);
  if (!existing) return false;

  const index = userTypes.findIndex((userType) => userType.id === id);
  userTypes[index] = {
    ...existing,
    status: USER_TYPE_STATUS.DELETED,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  return true;
}

export function userTypeExists(id: number): boolean {
  return getUserTypeById(id) !== undefined;
}

export function resetForTests(): void {
  userTypes = [];
  nextUserTypeId = 1;
}
