import type { UserLoginRecord, UserLoginInputRecord } from "@/server/store/user-login.store";
import { RECORD_STATUS, type RecordStatus } from "@/server/store/record-status";

let userLogins: UserLoginRecord[] = [];

function isActive(userLogin: UserLoginRecord): boolean {
  return userLogin.status === RECORD_STATUS.ACTIVE;
}

export function resetForTests(): void {
  userLogins = [];
}

export async function findByUsername(username: string): Promise<UserLoginRecord | undefined> {
  return userLogins.find((login) => isActive(login) && login.username === username);
}

export async function getByUserId(userId: string): Promise<UserLoginRecord | undefined> {
  return userLogins.find((login) => isActive(login) && login.userId === userId);
}

export async function createUserLogin(record: UserLoginInputRecord): Promise<UserLoginRecord> {
  const now = new Date().toISOString();
  const created: UserLoginRecord = {
    id: crypto.randomUUID(),
    userId: record.userId,
    username: record.username,
    passwordHash: record.passwordHash ?? "",
    forcePasswordChange: record.forcePasswordChange,
    status: RECORD_STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
    createdBy: "system",
    updatedBy: "system",
  };
  userLogins.push(created);
  return created;
}

export async function updateUserLogin(
  id: string,
  changes: Pick<UserLoginInputRecord, "username" | "passwordHash" | "forcePasswordChange">,
): Promise<UserLoginRecord | undefined> {
  const index = userLogins.findIndex((login) => login.id === id);
  if (index === -1) return undefined;
  const updated: UserLoginRecord = {
    ...userLogins[index],
    username: changes.username,
    passwordHash: changes.passwordHash ?? userLogins[index].passwordHash,
    forcePasswordChange: changes.forcePasswordChange,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  userLogins[index] = updated;
  return updated;
}

export async function setUserLoginStatus(
  id: string,
  status: RecordStatus,
): Promise<UserLoginRecord | undefined> {
  const index = userLogins.findIndex((login) => login.id === id);
  if (index === -1) return undefined;
  const updated: UserLoginRecord = {
    ...userLogins[index],
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  userLogins[index] = updated;
  return updated;
}

export async function deleteUserLoginByUser(userId: string): Promise<boolean> {
  const index = userLogins.findIndex((login) => login.userId === userId && isActive(login));
  if (index === -1) return false;
  userLogins[index] = {
    ...userLogins[index],
    status: RECORD_STATUS.DELETED,
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
  };
  return true;
}
