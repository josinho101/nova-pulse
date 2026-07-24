import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUserGroup,
  deleteUserGroup,
  getUserGroup,
  listUserGroups,
  updateUserGroup,
} from "./user-group.controller";
import { RECORD_STATUS } from "@/server/store/record-status";

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
const { resetForTests: resetMembers, addUserToGroup } = await import(
  "@/server/store/user-group-member.store"
);
const { addUser, resetForTests: resetUsers } = await import("@/server/store/user.store");

let actorId: string;

beforeEach(async () => {
  await resetUserGroups();
  await resetMembers();
  await resetUsers();
  actorId = crypto.randomUUID();
});

describe("createUserGroup", () => {
  it("creates a user group with a generated id", async () => {
    const result = await createUserGroup({ name: "Admin" }, actorId);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Admin");
    expect(result.data.id).toBeTruthy();
  });

  it("rejects an empty name", async () => {
    const result = await createUserGroup({ name: "" }, actorId);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("rejects a name longer than 20 characters", async () => {
    const result = await createUserGroup({ name: "a".repeat(21) }, actorId);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("rejects a duplicate active name", async () => {
    await createUserGroup({ name: "Admin" }, actorId);
    const result = await createUserGroup({ name: "Admin" }, actorId);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("allows reusing the name of a soft-deleted user group", async () => {
    const created = await createUserGroup({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await deleteUserGroup(created.data.id, actorId);
    const result = await createUserGroup({ name: "Admin" }, actorId);

    expect(result.ok).toBe(true);
  });

  it("populates audit fields and defaults status to active", async () => {
    const result = await createUserGroup({ name: "Admin" }, actorId);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe(RECORD_STATUS.ACTIVE);
    expect(result.data.createdBy).toBe(actorId);
    expect(result.data.updatedBy).toBe(actorId);
    expect(result.data.createdAt).toBe(result.data.updatedAt);
    expect(new Date(result.data.createdAt).toISOString()).toBe(result.data.createdAt);
  });
});

describe("getUserGroup", () => {
  it("returns the matching user group", async () => {
    const created = await createUserGroup({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await getUserGroup(created.data.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe(created.data.id);
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await getUserGroup(999999);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("updateUserGroup", () => {
  it("updates an existing user group", async () => {
    const created = await createUserGroup({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUserGroup(created.data.id, { name: "Managers" }, actorId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Managers");
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await updateUserGroup(999999, { name: "Whatever" }, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("rejects renaming to another active user group's name", async () => {
    const first = await createUserGroup({ name: "Admin" }, actorId);
    const second = await createUserGroup({ name: "Managers" }, actorId);
    if (!first.ok || !second.ok) throw new Error("setup failed");

    const result = await updateUserGroup(second.data.id, { name: "Admin" }, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });
});

describe("deleteUserGroup", () => {
  it("deletes an unreferenced user group", async () => {
    const created = await createUserGroup({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await deleteUserGroup(created.data.id, actorId);
    expect(result.ok).toBe(true);
  });

  it("hides the user group from listUserGroups after deletion", async () => {
    const created = await createUserGroup({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await deleteUserGroup(created.data.id, actorId);
    const result = await listUserGroups();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.some((userGroup) => userGroup.id === created.data.id)).toBe(false);
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await deleteUserGroup(999999, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("blocks deletion when referenced by a group member", async () => {
    const created = await createUserGroup({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

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
    await addUserToGroup(user.id, created.data.id, actorId);

    const result = await deleteUserGroup(created.data.id, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
  });

  it("does not block deleting the group after the member is removed", async () => {
    const created = await createUserGroup({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

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
    await addUserToGroup(user.id, created.data.id, actorId);
    await resetMembers();

    const result = await deleteUserGroup(created.data.id, actorId);
    expect(result.ok).toBe(true);
  });
});
