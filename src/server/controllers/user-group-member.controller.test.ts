import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addGroupMember,
  listGroupMembers,
  listGroupsForUser,
  removeGroupMember,
  setGroupsForUser,
} from "./user-group-member.controller";
import { createUserGroup } from "./user-group.controller";

vi.mock("@/server/store/user.store", async () => {
  const actual = await vi.importActual<typeof import("@/server/store/user.store")>(
    "@/server/store/user.store",
  );
  const fake = await import("@/server/store/user.store.fake");

  return {
    ...actual,
    resetForTests: fake.resetForTests,
    listUsers: fake.listUsers,
    getUserById: fake.getUserById,
    findUserByEmail: fake.findUserByEmail,
    addUser: fake.addUser,
    updateUser: fake.updateUser,
    deleteUser: fake.deleteUser,
    isUserTypeReferenced: fake.isUserTypeReferenced,
    userExists: fake.userExists,
  };
});

vi.mock("@/server/store/user-group-member.store", async () => {
  const fake = await import("@/server/store/user-group-member.store.fake");
  return { ...fake };
});

vi.mock("@/server/store/user-group.store", async () => {
  const actual = await vi.importActual<typeof import("@/server/store/user-group.store")>(
    "@/server/store/user-group.store",
  );
  const fake = await import("@/server/store/user-group.store.fake");
  const { isUserGroupReferenced } = await import("@/server/store/user-group-member.store");

  return {
    ...actual,
    resetForTests: fake.resetForTests,
    listUserGroups: fake.listUserGroups,
    getUserGroupById: fake.getUserGroupById,
    findUserGroupByName: fake.findUserGroupByName,
    addUserGroup: fake.addUserGroup,
    updateUserGroup: fake.updateUserGroup,
    userGroupExists: fake.userGroupExists,
    deleteUserGroup: fake.makeDeleteUserGroup(isUserGroupReferenced, actual.UserGroupReferencedError),
  };
});

const { resetForTests: resetUserGroups } = await import("@/server/store/user-group.store");
const { resetForTests: resetMembers } = await import("@/server/store/user-group-member.store");
const { addUser, resetForTests: resetUsers } = await import("@/server/store/user.store");

let actorId: string;
let groupId: number;
let userId: string;

beforeEach(async () => {
  await resetUserGroups();
  await resetMembers();
  await resetUsers();
  actorId = crypto.randomUUID();

  const group = await createUserGroup({ name: "Admin" }, actorId);
  if (!group.ok) throw new Error("setup failed");
  groupId = group.data.id;

  const user = await addUser(
    {
      firstName: "Jane",
      lastName: "Doe",
      dob: "1990-01-01",
      address: "123 Main St",
      email: "jane@example.com",
      typeId: 1,
    },
    actorId,
  );
  userId = user.id;
});

describe("addGroupMember", () => {
  it("adds a user to a group", async () => {
    const result = await addGroupMember(groupId, userId, actorId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.userId).toBe(userId);
    expect(result.data.groupId).toBe(groupId);
  });

  it("returns 404 for a nonexistent group", async () => {
    const result = await addGroupMember(999999, userId, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("returns 404 for a nonexistent user", async () => {
    const result = await addGroupMember(groupId, crypto.randomUUID(), actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("rejects adding the same user to the same group twice", async () => {
    await addGroupMember(groupId, userId, actorId);
    const result = await addGroupMember(groupId, userId, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
  });
});

describe("listGroupMembers", () => {
  it("lists members of a group", async () => {
    await addGroupMember(groupId, userId, actorId);
    const result = await listGroupMembers(groupId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.some((member) => member.userId === userId)).toBe(true);
  });

  it("returns 404 for a nonexistent group", async () => {
    const result = await listGroupMembers(999999);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("removeGroupMember", () => {
  it("removes a user from a group", async () => {
    await addGroupMember(groupId, userId, actorId);
    const result = await removeGroupMember(groupId, userId);
    expect(result.ok).toBe(true);

    const members = await listGroupMembers(groupId);
    expect(members.ok).toBe(true);
    if (!members.ok) return;
    expect(members.data.some((member) => member.userId === userId)).toBe(false);
  });

  it("returns 404 when the user is not a member of the group", async () => {
    const result = await removeGroupMember(groupId, userId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("returns 404 for a nonexistent group", async () => {
    const result = await removeGroupMember(999999, userId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("listGroupsForUser", () => {
  it("lists the groups a user belongs to", async () => {
    await addGroupMember(groupId, userId, actorId);
    const result = await listGroupsForUser(userId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.some((member) => member.groupId === groupId)).toBe(true);
  });

  it("returns 404 for a nonexistent user", async () => {
    const result = await listGroupsForUser(crypto.randomUUID());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("setGroupsForUser", () => {
  it("adds the user to the given groups", async () => {
    const result = await setGroupsForUser(userId, [groupId], actorId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.some((member) => member.groupId === groupId)).toBe(true);
  });

  it("removes the user from groups not in the given list", async () => {
    await addGroupMember(groupId, userId, actorId);
    const result = await setGroupsForUser(userId, [], actorId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(0);
  });

  it("is idempotent when the group list is unchanged", async () => {
    await addGroupMember(groupId, userId, actorId);
    const result = await setGroupsForUser(userId, [groupId], actorId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.map((member) => member.groupId)).toEqual([groupId]);
  });

  it("returns 404 for a nonexistent user", async () => {
    const result = await setGroupsForUser(crypto.randomUUID(), [groupId], actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("returns 404 for a nonexistent group", async () => {
    const result = await setGroupsForUser(userId, [999999], actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});
