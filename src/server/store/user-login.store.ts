import { pool } from "@/server/db/pool";
import type { RecordStatus } from "@/server/store/record-status";

export interface UserLoginRecord {
  id: string;
  userId: string;
  username: string;
  passwordHash: string;
  forcePasswordChange: boolean;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserLoginInputRecord {
  userId: string;
  username: string;
  passwordHash: string | null;
  forcePasswordChange: boolean;
}

interface UserLoginRow {
  id: string;
  user_id: string;
  username: string;
  password_hash: string;
  force_password_change: boolean;
  status: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

function toRecord(row: UserLoginRow): UserLoginRecord {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    passwordHash: row.password_hash,
    forcePasswordChange: row.force_password_change,
    status: row.status as RecordStatus,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

export async function findByUsername(username: string): Promise<UserLoginRecord | undefined> {
  const result = await pool.query<UserLoginRow>(
    "SELECT * FROM sp_find_user_login_by_username($1)",
    [username],
  );
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function getByUserId(userId: string): Promise<UserLoginRecord | undefined> {
  const result = await pool.query<UserLoginRow>("SELECT * FROM sp_get_user_login_by_user($1)", [
    userId,
  ]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function createUserLogin(record: UserLoginInputRecord): Promise<UserLoginRecord> {
  const result = await pool.query<UserLoginRow>(
    "SELECT * FROM sp_create_user_login($1, $2, $3, $4)",
    [record.userId, record.username, record.passwordHash, record.forcePasswordChange],
  );
  return toRecord(result.rows[0]);
}

export async function updateUserLogin(
  id: string,
  changes: Pick<UserLoginInputRecord, "username" | "passwordHash" | "forcePasswordChange">,
): Promise<UserLoginRecord | undefined> {
  const result = await pool.query<UserLoginRow>(
    "SELECT * FROM sp_update_user_login($1, $2, $3, $4)",
    [id, changes.username, changes.passwordHash, changes.forcePasswordChange],
  );
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function setUserLoginStatus(
  id: string,
  status: RecordStatus,
): Promise<UserLoginRecord | undefined> {
  const result = await pool.query<UserLoginRow>(
    "SELECT * FROM sp_set_user_login_status($1, $2)",
    [id, status],
  );
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function deleteUserLoginByUser(userId: string): Promise<boolean> {
  const result = await pool.query<UserLoginRow>(
    "SELECT * FROM sp_delete_user_login_by_user($1)",
    [userId],
  );
  return result.rows.length > 0;
}

export async function resetForTests(): Promise<void> {
  await pool.query("TRUNCATE TABLE user_login RESTART IDENTITY CASCADE");
}
