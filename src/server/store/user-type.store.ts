import { pool } from "@/server/db/pool";
import type { RecordStatus } from "@/server/store/record-status";

export type UserTypeStatus = RecordStatus;

export interface UserTypeRecord {
  id: number;
  name: string;
  status: UserTypeStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

const USER_TYPE_REFERENCED_ERROR_CODE = "NP001";

export class UserTypeReferencedError extends Error {
  constructor(id: number) {
    super(`UserType ${id} is referenced by one or more active users`);
    this.name = "UserTypeReferencedError";
  }
}

interface UserTypeRow {
  id: number;
  name: string;
  status: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

function toRecord(row: UserTypeRow): UserTypeRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status as UserTypeStatus,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

export async function listUserTypes(): Promise<UserTypeRecord[]> {
  const result = await pool.query<UserTypeRow>("SELECT * FROM sp_list_user_types()");
  return result.rows.map(toRecord);
}

export async function getUserTypeById(id: number): Promise<UserTypeRecord | undefined> {
  const result = await pool.query<UserTypeRow>("SELECT * FROM sp_get_user_type($1)", [id]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function findUserTypeByName(
  name: string,
  excludeId?: number,
): Promise<UserTypeRecord | undefined> {
  const result = await pool.query<UserTypeRow>(
    "SELECT * FROM sp_find_user_type_by_name($1, $2)",
    [name, excludeId ?? null],
  );
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function addUserType(record: { name: string }): Promise<UserTypeRecord> {
  const result = await pool.query<UserTypeRow>("SELECT * FROM sp_create_user_type($1)", [
    record.name,
  ]);
  return toRecord(result.rows[0]);
}

export async function updateUserType(
  id: number,
  changes: { name: string },
): Promise<UserTypeRecord | undefined> {
  const result = await pool.query<UserTypeRow>("SELECT * FROM sp_update_user_type($1, $2)", [
    id,
    changes.name,
  ]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function deleteUserType(id: number): Promise<boolean> {
  try {
    await pool.query("SELECT sp_delete_user_type($1)", [id]);
    return true;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === USER_TYPE_REFERENCED_ERROR_CODE
    ) {
      throw new UserTypeReferencedError(id);
    }
    throw error;
  }
}

export async function userTypeExists(id: number): Promise<boolean> {
  return (await getUserTypeById(id)) !== undefined;
}

export async function resetForTests(): Promise<void> {
  await pool.query("TRUNCATE TABLE users, user_types RESTART IDENTITY CASCADE");
}
