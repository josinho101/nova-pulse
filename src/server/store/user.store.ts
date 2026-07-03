export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  address: string;
  email: string;
  typeId: number;
}

let users: UserRecord[] = [];

export function listUsers(): UserRecord[] {
  return users;
}

export function getUserById(id: string): UserRecord | undefined {
  return users.find((user) => user.id === id);
}

export function addUser(record: UserRecord): UserRecord {
  users.push(record);
  return record;
}

export function updateUser(id: string, record: UserRecord): UserRecord | undefined {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  users[index] = record;
  return record;
}

export function deleteUser(id: string): boolean {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

export function findUserByEmail(email: string, excludeId?: string): UserRecord | undefined {
  return users.find((user) => user.email === email && user.id !== excludeId);
}

export function isUserTypeReferenced(typeId: number): boolean {
  return users.some((user) => user.typeId === typeId);
}

export function resetForTests(): void {
  users = [];
}
