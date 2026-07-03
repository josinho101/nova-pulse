export interface UserTypeRecord {
  id: number;
  name: string;
}

let userTypes: UserTypeRecord[] = [];
let nextUserTypeId = 1;

export function listUserTypes(): UserTypeRecord[] {
  return userTypes;
}

export function getUserTypeById(id: number): UserTypeRecord | undefined {
  return userTypes.find((userType) => userType.id === id);
}

export function addUserType(record: Omit<UserTypeRecord, "id">): UserTypeRecord {
  const created: UserTypeRecord = { id: nextUserTypeId++, ...record };
  userTypes.push(created);
  return created;
}

export function updateUserType(id: number, record: UserTypeRecord): UserTypeRecord | undefined {
  const index = userTypes.findIndex((userType) => userType.id === id);
  if (index === -1) return undefined;
  userTypes[index] = record;
  return record;
}

export function deleteUserType(id: number): boolean {
  const index = userTypes.findIndex((userType) => userType.id === id);
  if (index === -1) return false;
  userTypes.splice(index, 1);
  return true;
}

export function userTypeExists(id: number): boolean {
  return userTypes.some((userType) => userType.id === id);
}

export function resetForTests(): void {
  userTypes = [];
  nextUserTypeId = 1;
}
