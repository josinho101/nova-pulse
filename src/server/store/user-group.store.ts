import { pool } from "@/server/db/pool";
import type { RecordStatus } from "@/server/store/record-status";

export type UserGroupStatus = RecordStatus;

export interface UserGroupRecord {
  id: number;
  name: string;
  status: UserGroupStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

const USER_GROUP_REFERENCED_ERROR_CODE = "NP002";

export class UserGroupReferencedError extends Error {
  constructor(id: number) {
    super(`UserGroup ${id} is referenced by one or more members`);
    this.name = "UserGroupReferencedError";
  }
}

interface UserGroupRow {
  id: number;
  name: string;
  status: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

function toRecord(row: UserGroupRow): UserGroupRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status as UserGroupStatus,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
  };
}

export async function listUserGroups(): Promise<UserGroupRecord[]> {
  const result = await pool.query<UserGroupRow>("SELECT * FROM sp_list_user_groups()");
  return result.rows.map(toRecord);
}

export async function getUserGroupById(id: number): Promise<UserGroupRecord | undefined> {
  const result = await pool.query<UserGroupRow>("SELECT * FROM sp_get_user_group($1)", [id]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function findUserGroupByName(
  name: string,
  excludeId?: number,
): Promise<UserGroupRecord | undefined> {
  const result = await pool.query<UserGroupRow>(
    "SELECT * FROM sp_find_user_group_by_name($1, $2)",
    [name, excludeId ?? null],
  );
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function addUserGroup(
  record: { name: string },
  createdBy: string,
): Promise<UserGroupRecord> {
  const result = await pool.query<UserGroupRow>("SELECT * FROM sp_create_user_group($1, $2)", [
    record.name,
    createdBy,
  ]);
  return toRecord(result.rows[0]);
}

export async function updateUserGroup(
  id: number,
  changes: { name: string },
  updatedBy: string,
): Promise<UserGroupRecord | undefined> {
  const result = await pool.query<UserGroupRow>("SELECT * FROM sp_update_user_group($1, $2, $3)", [
    id,
    changes.name,
    updatedBy,
  ]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function setUserGroupActor(
  id: number,
  actorId: string,
): Promise<UserGroupRecord | undefined> {
  const result = await pool.query<UserGroupRow>("SELECT * FROM sp_set_user_group_actor($1, $2)", [
    id,
    actorId,
  ]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function deleteUserGroup(id: number, updatedBy: string): Promise<boolean> {
  try {
    await pool.query("SELECT sp_delete_user_group($1, $2)", [id, updatedBy]);
    return true;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === USER_GROUP_REFERENCED_ERROR_CODE
    ) {
      throw new UserGroupReferencedError(id);
    }
    throw error;
  }
}

export async function userGroupExists(id: number): Promise<boolean> {
  return (await getUserGroupById(id)) !== undefined;
}

export async function resetForTests(): Promise<void> {
  await pool.query("TRUNCATE TABLE user_group_members, user_groups RESTART IDENTITY CASCADE");
}
