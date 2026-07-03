export interface UserTypeRecord {
  id: string;
  name: string;
}

let userTypes: UserTypeRecord[] = [];

export function listUserTypes(): UserTypeRecord[] {
  return userTypes;
}

export function getUserTypeById(id: string): UserTypeRecord | undefined {
  return userTypes.find((userType) => userType.id === id);
}

export function addUserType(record: UserTypeRecord): UserTypeRecord {
  userTypes.push(record);
  return record;
}

export function updateUserType(id: string, record: UserTypeRecord): UserTypeRecord | undefined {
  const index = userTypes.findIndex((userType) => userType.id === id);
  if (index === -1) return undefined;
  userTypes[index] = record;
  return record;
}

export function deleteUserType(id: string): boolean {
  const index = userTypes.findIndex((userType) => userType.id === id);
  if (index === -1) return false;
  userTypes.splice(index, 1);
  return true;
}

export function userTypeExists(id: string): boolean {
  return userTypes.some((userType) => userType.id === id);
}

export function resetForTests(): void {
  userTypes = [];
}
