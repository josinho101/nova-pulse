import { RECORD_STATUS, type RecordStatus } from "@/server/store/record-status";

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  address: string;
  email: string;
  typeId: number;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

let users: UserRecord[] = [];

function isActive(user: UserRecord): boolean {
  return user.status === RECORD_STATUS.ACTIVE;
}

export function listUsers(): UserRecord[] {
  return users.filter(isActive);
}

export function getUserById(id: string): UserRecord | undefined {
  const user = users.find((candidate) => candidate.id === id);
  return user && isActive(user) ? user : undefined;
}

export interface UserInputRecord {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  address: string;
  email: string;
  typeId: number;
}

export function addUser(record: UserInputRecord): UserRecord {
  const now = new Date().toISOString();
  const created: UserRecord = {
    id: crypto.randomUUID(),
    ...record,
    status: RECORD_STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
    createdBy: "system",
    updatedBy: "system",
  };
  users.push(created);
  return created;
}

export function updateUser(id: string, changes: UserInputRecord): UserRecord | undefined {
  const existing = getUserById(id);
  if (!existing) return undefined;

  const index = users.findIndex((user) => user.id === id);
  const updated: UserRecord = {
    ...existing,
    ...changes,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  users[index] = updated;
  return updated;
}

export function deleteUser(id: string): boolean {
  const existing = getUserById(id);
  if (!existing) return false;

  const index = users.findIndex((user) => user.id === id);
  users[index] = {
    ...existing,
    status: RECORD_STATUS.DELETED,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  return true;
}

export function findUserByEmail(email: string, excludeId?: string): UserRecord | undefined {
  return users.find((user) => isActive(user) && user.email === email && user.id !== excludeId);
}

export function isUserTypeReferenced(typeId: number): boolean {
  return users.some((user) => isActive(user) && user.typeId === typeId);
}

export function userExists(id: string): boolean {
  return getUserById(id) !== undefined;
}

export function resetForTests(): void {
  users = [];
}
