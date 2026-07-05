import type { UserRecord, UserInputRecord } from "@/server/store/user.store";
import { RECORD_STATUS } from "@/server/store/record-status";

let users: UserRecord[] = [];

function isActive(user: UserRecord): boolean {
  return user.status === RECORD_STATUS.ACTIVE;
}

export function resetForTests(): void {
  users = [];
}

export async function listUsers(): Promise<UserRecord[]> {
  return users.filter(isActive);
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const user = users.find((candidate) => candidate.id === id);
  return user && isActive(user) ? user : undefined;
}

export async function findUserByEmail(
  email: string,
  excludeId?: string,
): Promise<UserRecord | undefined> {
  return users.find((user) => isActive(user) && user.email === email && user.id !== excludeId);
}

export async function addUser(record: UserInputRecord): Promise<UserRecord> {
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

export async function updateUser(
  id: string,
  changes: UserInputRecord,
): Promise<UserRecord | undefined> {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  const updated: UserRecord = {
    ...users[index],
    ...changes,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  users[index] = updated;
  return updated;
}

export async function deleteUser(id: string): Promise<boolean> {
  const index = users.findIndex((user) => user.id === id && isActive(user));
  if (index === -1) return false;
  users[index] = {
    ...users[index],
    status: RECORD_STATUS.DELETED,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  return true;
}

export async function isUserTypeReferenced(typeId: number): Promise<boolean> {
  return users.some((user) => isActive(user) && user.typeId === typeId);
}

export async function userExists(id: string): Promise<boolean> {
  return (await getUserById(id)) !== undefined;
}
