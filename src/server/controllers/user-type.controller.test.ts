import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUserType,
  deleteUserType,
  getUserType,
  listUserTypes,
  updateUserType,
} from "./user-type.controller";
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

vi.mock("@/server/store/user-type.store", async () => {
  const actual = await vi.importActual<typeof import("@/server/store/user-type.store")>(
    "@/server/store/user-type.store",
  );
  const fake = await import("@/server/store/user-type.store.fake");
  const { isUserTypeReferenced } = await import("@/server/store/user.store");

  return {
    ...actual,
    resetForTests: fake.resetForTests,
    listUserTypes: fake.listUserTypes,
    getUserTypeById: fake.getUserTypeById,
    findUserTypeByName: fake.findUserTypeByName,
    addUserType: fake.addUserType,
    updateUserType: fake.updateUserType,
    userTypeExists: fake.userTypeExists,
    deleteUserType: fake.makeDeleteUserType(isUserTypeReferenced, actual.UserTypeReferencedError),
  };
});

const { resetForTests: resetUserTypes } = await import("@/server/store/user-type.store");
const { addUser, deleteUser, resetForTests: resetUsers } = await import("@/server/store/user.store");

let actorId: string;

beforeEach(async () => {
  await resetUserTypes();
  await resetUsers();
  actorId = crypto.randomUUID();
});

describe("createUserType", () => {
  it("creates a user type with a generated id", async () => {
    const result = await createUserType({ name: "Admin" }, actorId);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Admin");
    expect(result.data.id).toBeTruthy();
  });

  it("rejects an empty name", async () => {
    const result = await createUserType({ name: "" }, actorId);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("rejects a name longer than 20 characters", async () => {
    const result = await createUserType({ name: "a".repeat(21) }, actorId);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("rejects a duplicate active name", async () => {
    await createUserType({ name: "Admin" }, actorId);
    const result = await createUserType({ name: "Admin" }, actorId);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("allows reusing the name of a soft-deleted user type", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await deleteUserType(created.data.id, actorId);
    const result = await createUserType({ name: "Admin" }, actorId);

    expect(result.ok).toBe(true);
  });

  it("populates audit fields and defaults status to active", async () => {
    const result = await createUserType({ name: "Admin" }, actorId);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe(RECORD_STATUS.ACTIVE);
    expect(result.data.createdBy).toBe(actorId);
    expect(result.data.updatedBy).toBe(actorId);
    expect(result.data.createdAt).toBe(result.data.updatedAt);
    expect(new Date(result.data.createdAt).toISOString()).toBe(result.data.createdAt);
  });

  it("ignores client-supplied status/audit fields", async () => {
    const result = await createUserType(
      {
        name: "Admin",
        status: 2,
        createdBy: "hacker",
        updatedBy: "hacker",
      },
      actorId,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe(RECORD_STATUS.ACTIVE);
    expect(result.data.createdBy).toBe(actorId);
    expect(result.data.updatedBy).toBe(actorId);
  });
});

describe("getUserType", () => {
  it("returns the matching user type", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await getUserType(created.data.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe(created.data.id);
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await getUserType(999999);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("updateUserType", () => {
  it("updates an existing user type", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUserType(created.data.id, { name: "Super Admin" }, actorId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Super Admin");
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await updateUserType(999999, { name: "Whatever" }, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("returns 400 for an invalid body", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUserType(created.data.id, { name: "" }, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it("rejects a name longer than 20 characters", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUserType(created.data.id, { name: "a".repeat(21) }, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it("allows saving with its own unchanged name", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUserType(created.data.id, { name: "Admin" }, actorId);
    expect(result.ok).toBe(true);
  });

  it("rejects renaming to another active user type's name", async () => {
    const first = await createUserType({ name: "Admin" }, actorId);
    const second = await createUserType({ name: "Manager" }, actorId);
    if (!first.ok || !second.ok) throw new Error("setup failed");

    const result = await updateUserType(second.data.id, { name: "Admin" }, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("preserves createdAt/createdBy/status while refreshing updatedAt/updatedBy", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUserType(created.data.id, { name: "Super Admin" }, actorId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.createdAt).toBe(created.data.createdAt);
    expect(result.data.createdBy).toBe(created.data.createdBy);
    expect(result.data.status).toBe(created.data.status);
    expect(result.data.updatedBy).toBe(actorId);
    expect(new Date(result.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.data.updatedAt).getTime(),
    );
  });

  it("returns 404 for a soft-deleted user type", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await deleteUserType(created.data.id, actorId);
    const result = await updateUserType(created.data.id, { name: "Whatever" }, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("deleteUserType", () => {
  it("deletes an unreferenced user type", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const result = await deleteUserType(created.data.id, actorId);
    expect(result.ok).toBe(true);
  });

  it("hides the user type from getUserType after deletion", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await deleteUserType(created.data.id, actorId);
    const result = await getUserType(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("hides the user type from listUserTypes after deletion", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await deleteUserType(created.data.id, actorId);
    const result = await listUserTypes();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.some((userType) => userType.id === created.data.id)).toBe(false);
  });

  it("returns 404 when deleting an already-deleted user type", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await deleteUserType(created.data.id, actorId);
    const result = await deleteUserType(created.data.id, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("blocks deletion when referenced by a user", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    await addUser(
      {
        firstName: "Jane",
        lastName: "Doe",
        dob: "1990-01-01",
        address: "123 Main St",
        email: "jane@example.com",
        typeId: created.data.id,
      },
      actorId,
    );

    const result = await deleteUserType(created.data.id, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
  });

  it("does not block deleting the referenced UserType after the user is soft-deleted", async () => {
    const created = await createUserType({ name: "Admin" }, actorId);
    if (!created.ok) throw new Error("setup failed");

    const user = await addUser(
      {
        firstName: "Jane",
        lastName: "Doe",
        dob: "1990-01-01",
        address: "123 Main St",
        email: "jane@example.com",
        typeId: created.data.id,
      },
      actorId,
    );

    await deleteUser(user.id, actorId);
    const result = await deleteUserType(created.data.id, actorId);
    expect(result.ok).toBe(true);
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await deleteUserType(999999, actorId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});
