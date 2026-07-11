import { pool } from "@/server/db/pool";
import { RECORD_STATUS, type RecordStatus } from "@/server/store/record-status";

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob?: string;
  address?: string;
  phone?: string;
  email?: string;
  typeId: number;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserInputRecord {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob?: string;
  address?: string;
  phone?: string;
  email?: string;
  typeId: number;
}

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  dob: string | Date | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  type_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

function toDateOnly(dob: string | Date | null): string | undefined {
  if (dob === null) return undefined;
  return dob instanceof Date ? dob.toISOString().slice(0, 10) : dob;
}

function toRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    middleName: row.middle_name ?? undefined,
    dob: toDateOnly(row.dob),
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    typeId: row.type_id,
    status: row.status as RecordStatus,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

export async function listUsers(search?: string): Promise<UserRecord[]> {
  const result = await pool.query<UserRow>("SELECT * FROM sp_list_users($1)", [search ?? null]);
  return result.rows.map(toRecord);
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRow>("SELECT * FROM sp_get_user($1)", [id]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function findUserByEmail(
  email: string,
  excludeId?: string,
): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRow>("SELECT * FROM sp_find_user_by_email($1, $2)", [
    email,
    excludeId ?? null,
  ]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function addUser(record: UserInputRecord): Promise<UserRecord> {
  const result = await pool.query<UserRow>(
    "SELECT * FROM sp_create_user($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      record.firstName,
      record.lastName,
      record.middleName ?? null,
      record.dob ?? null,
      record.address ?? null,
      record.phone ?? null,
      record.email ?? null,
      record.typeId,
    ],
  );
  return toRecord(result.rows[0]);
}

export async function updateUser(
  id: string,
  changes: UserInputRecord,
): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRow>(
    "SELECT * FROM sp_update_user($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [
      id,
      changes.firstName,
      changes.lastName,
      changes.middleName ?? null,
      changes.dob ?? null,
      changes.address ?? null,
      changes.phone ?? null,
      changes.email ?? null,
      changes.typeId,
    ],
  );
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function findUserByTypeId(typeId: number): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRow>("SELECT * FROM sp_find_user_by_type($1)", [typeId]);
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await pool.query<UserRow>("SELECT * FROM sp_delete_user($1)", [id]);
  return result.rows.length > 0;
}

export async function isUserTypeReferenced(typeId: number): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM users WHERE type_id = $1 AND status = $2 LIMIT 1", [
    typeId,
    RECORD_STATUS.ACTIVE,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function userExists(id: string): Promise<boolean> {
  return (await getUserById(id)) !== undefined;
}

export async function resetForTests(): Promise<void> {
  await pool.query("TRUNCATE TABLE users, user_types RESTART IDENTITY CASCADE");
}
