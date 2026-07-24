import { pool } from "@/server/db/pool";

export interface UserGroupMemberRecord {
  id: number;
  userId: string;
  groupId: number;
  createdAt: string;
  createdBy?: string;
}

interface UserGroupMemberRow {
  id: number;
  user_id: string;
  group_id: number;
  created_at: string;
  created_by: string | null;
}

function toRecord(row: UserGroupMemberRow): UserGroupMemberRecord {
  return {
    id: row.id,
    userId: row.user_id,
    groupId: row.group_id,
    createdAt: new Date(row.created_at).toISOString(),
    createdBy: row.created_by ?? undefined,
  };
}

export async function listMembersByGroup(groupId: number): Promise<UserGroupMemberRecord[]> {
  const result = await pool.query<UserGroupMemberRow>(
    "SELECT * FROM sp_list_user_group_members($1)",
    [groupId],
  );
  return result.rows.map(toRecord);
}

export async function listGroupsForUser(userId: string): Promise<UserGroupMemberRecord[]> {
  const result = await pool.query<UserGroupMemberRow>("SELECT * FROM sp_list_groups_for_user($1)", [
    userId,
  ]);
  return result.rows.map(toRecord);
}

export async function findMembership(
  userId: string,
  groupId: number,
): Promise<UserGroupMemberRecord | undefined> {
  const members = await listMembersByGroup(groupId);
  return members.find((member) => member.userId === userId);
}

export async function addUserToGroup(
  userId: string,
  groupId: number,
  createdBy: string,
): Promise<UserGroupMemberRecord | undefined> {
  const result = await pool.query<UserGroupMemberRow>(
    "SELECT * FROM sp_add_user_to_group($1, $2, $3)",
    [userId, groupId, createdBy],
  );
  return result.rows[0] ? toRecord(result.rows[0]) : undefined;
}

export async function removeUserFromGroup(userId: string, groupId: number): Promise<void> {
  await pool.query("SELECT sp_remove_user_from_group($1, $2)", [userId, groupId]);
}

export async function isUserGroupReferenced(groupId: number): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM user_group_members WHERE group_id = $1 LIMIT 1", [
    groupId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function resetForTests(): Promise<void> {
  await pool.query("TRUNCATE TABLE user_group_members RESTART IDENTITY CASCADE");
}
