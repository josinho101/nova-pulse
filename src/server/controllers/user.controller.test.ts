import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "./user.controller";
import { createUserType } from "./user-type.controller";

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

const { resetForTests: resetUsers } = await import("@/server/store/user.store");
const { resetForTests: resetUserTypes } = await import("@/server/store/user-type.store");

beforeEach(async () => {
  await resetUsers();
  await resetUserTypes();
});

async function createTestUserType() {
  const result = await createUserType({ name: "Admin" });
  if (!result.ok) throw new Error("setup failed");
  return result.data;
}

function baseInput(typeId: number) {
  return {
    firstName: "Jane",
    lastName: "Doe",
    dob: "1990-01-01",
    address: "123 Main St",
    email: "jane@example.com",
    typeId,
  };
}

describe("createUser", () => {
  it("creates a user with a generated id", async () => {
    const userType = await createTestUserType();
    const result = await createUser(baseInput(userType.id));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBeTruthy();
    expect(result.data.email).toBe("jane@example.com");
  });

  it("succeeds without middleName since it is optional", async () => {
    const userType = await createTestUserType();
    const result = await createUser(baseInput(userType.id));

    expect(result.ok).toBe(true);
  });

  it("succeeds without address since it is optional", async () => {
    const userType = await createTestUserType();
    const input = baseInput(userType.id) as Record<string, unknown>;
    delete input.address;

    const result = await createUser(input);
    expect(result.ok).toBe(true);
  });

  it("succeeds without phone since it is optional", async () => {
    const userType = await createTestUserType();
    const result = await createUser(baseInput(userType.id));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.phone).toBeUndefined();
  });

  it("succeeds with a valid numeric phone", async () => {
    const userType = await createTestUserType();
    const result = await createUser({ ...baseInput(userType.id), phone: "5551234567" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.phone).toBe("5551234567");
  });

  it("rejects a non-numeric phone", async () => {
    const userType = await createTestUserType();
    const result = await createUser({ ...baseInput(userType.id), phone: "555-CALL" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "phone")).toBe(true);
  });

  it("rejects an invalid email format", async () => {
    const userType = await createTestUserType();
    const result = await createUser({ ...baseInput(userType.id), email: "not-an-email" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "email")).toBe(true);
  });

  it("rejects a missing required field", async () => {
    const userType = await createTestUserType();
    const input = baseInput(userType.id) as Record<string, unknown>;
    delete input.firstName;

    const result = await createUser(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "firstName")).toBe(true);
  });

  it("rejects a typeId that does not reference an existing UserType", async () => {
    const result = await createUser(baseInput(999999));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "typeId")).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    const userType = await createTestUserType();
    await createUser(baseInput(userType.id));

    const result = await createUser(baseInput(userType.id));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "email")).toBe(true);
  });

  it("populates audit fields and defaults status to active", async () => {
    const userType = await createTestUserType();
    const result = await createUser(baseInput(userType.id));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe(1);
    expect(result.data.createdBy).toBe("system");
    expect(result.data.updatedBy).toBe("system");
    expect(result.data.createdAt).toBe(result.data.updatedAt);
    expect(new Date(result.data.createdAt).toISOString()).toBe(result.data.createdAt);
  });

  it("ignores client-supplied status/audit fields", async () => {
    const userType = await createTestUserType();
    const result = await createUser({
      ...baseInput(userType.id),
      status: 2,
      createdBy: "hacker",
      updatedBy: "hacker",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe(1);
    expect(result.data.createdBy).toBe("system");
    expect(result.data.updatedBy).toBe("system");
  });
});

describe("listUsers", () => {
  it("defaults to page 1 with a page size of 10", async () => {
    const userType = await createTestUserType();
    for (let i = 0; i < 15; i++) {
      await createUser({ ...baseInput(userType.id), email: `user${i}@example.com` });
    }

    const result = await listUsers();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.page).toBe(1);
    expect(result.data.pageSize).toBe(10);
    expect(result.data.total).toBe(15);
    expect(result.data.items).toHaveLength(10);
  });

  it("returns the requested page", async () => {
    const userType = await createTestUserType();
    for (let i = 0; i < 15; i++) {
      await createUser({ ...baseInput(userType.id), email: `user${i}@example.com` });
    }

    const result = await listUsers(2, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.page).toBe(2);
    expect(result.data.items).toHaveLength(5);
  });

  it("sorts by lastName according to sortOrder", async () => {
    const userType = await createTestUserType();
    await createUser({ ...baseInput(userType.id), lastName: "Zeta", email: "zeta@example.com" });
    await createUser({ ...baseInput(userType.id), lastName: "Alpha", email: "alpha@example.com" });

    const ascending = await listUsers(1, 10, "lastName", "asc");
    expect(ascending.ok).toBe(true);
    if (!ascending.ok) return;
    expect(ascending.data.items.map((user) => user.lastName)).toEqual(["Alpha", "Zeta"]);

    const descending = await listUsers(1, 10, "lastName", "desc");
    expect(descending.ok).toBe(true);
    if (!descending.ok) return;
    expect(descending.data.items.map((user) => user.lastName)).toEqual(["Zeta", "Alpha"]);
  });

  it("sorts by firstName", async () => {
    const userType = await createTestUserType();
    await createUser({ ...baseInput(userType.id), firstName: "Zeta", email: "zeta@example.com" });
    await createUser({ ...baseInput(userType.id), firstName: "Alpha", email: "alpha@example.com" });

    const result = await listUsers(1, 10, "firstName", "asc");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items.map((user) => user.firstName)).toEqual(["Alpha", "Zeta"]);
  });

  it("sorts by email", async () => {
    const userType = await createTestUserType();
    await createUser({ ...baseInput(userType.id), email: "zeta@example.com" });
    await createUser({ ...baseInput(userType.id), email: "alpha@example.com" });

    const result = await listUsers(1, 10, "email", "asc");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items.map((user) => user.email)).toEqual([
      "alpha@example.com",
      "zeta@example.com",
    ]);
  });

  it("sorts by userType using the resolved type name, not typeId", async () => {
    const zetaType = await createUserType({ name: "Zeta Type" });
    const alphaType = await createUserType({ name: "Alpha Type" });
    if (!zetaType.ok || !alphaType.ok) throw new Error("setup failed");

    await createUser({ ...baseInput(zetaType.data.id), email: "a@example.com" });
    await createUser({ ...baseInput(alphaType.data.id), email: "b@example.com" });

    const result = await listUsers(1, 10, "userType", "asc");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items.map((user) => user.typeId)).toEqual([
      alphaType.data.id,
      zetaType.data.id,
    ]);
  });

  it("sorts by createdAt/updatedAt/createdBy/updatedBy", async () => {
    const userType = await createTestUserType();
    await createUser({ ...baseInput(userType.id), email: "first@example.com" });
    await createUser({ ...baseInput(userType.id), email: "second@example.com" });

    for (const field of ["createdAt", "updatedAt", "createdBy", "updatedBy"] as const) {
      const result = await listUsers(1, 10, field, "asc");
      expect(result.ok).toBe(true);
    }
  });

  it("falls back to lastName sort for an invalid sortBy value", async () => {
    const userType = await createTestUserType();
    await createUser({ ...baseInput(userType.id), lastName: "Zeta", email: "zeta@example.com" });
    await createUser({ ...baseInput(userType.id), lastName: "Alpha", email: "alpha@example.com" });

    const result = await listUsers(1, 10, "notAField" as never, "asc");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items.map((user) => user.lastName)).toEqual(["Alpha", "Zeta"]);
  });

  it("falls back to defaults for invalid page/pageSize values", async () => {
    const userType = await createTestUserType();
    await createUser(baseInput(userType.id));

    const result = await listUsers(0, -5);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.page).toBe(1);
    expect(result.data.pageSize).toBe(10);
  });

  it("filters by search across firstName, lastName, email, and phone", async () => {
    const userType = await createTestUserType();
    await createUser({
      ...baseInput(userType.id),
      firstName: "Alice",
      lastName: "Anderson",
      email: "alice@example.com",
      phone: "1112223333",
    });
    await createUser({
      ...baseInput(userType.id),
      firstName: "Bob",
      lastName: "Baker",
      email: "bob@example.com",
      phone: "4445556666",
    });

    const byFirstName = await listUsers(1, 10, "firstName", "asc", "alice");
    expect(byFirstName.ok).toBe(true);
    if (!byFirstName.ok) return;
    expect(byFirstName.data.items.map((user) => user.firstName)).toEqual(["Alice"]);

    const byLastName = await listUsers(1, 10, "firstName", "asc", "BAKER");
    expect(byLastName.ok).toBe(true);
    if (!byLastName.ok) return;
    expect(byLastName.data.items.map((user) => user.lastName)).toEqual(["Baker"]);

    const byEmail = await listUsers(1, 10, "firstName", "asc", "bob@example");
    expect(byEmail.ok).toBe(true);
    if (!byEmail.ok) return;
    expect(byEmail.data.items).toHaveLength(1);

    const byPhone = await listUsers(1, 10, "firstName", "asc", "222333");
    expect(byPhone.ok).toBe(true);
    if (!byPhone.ok) return;
    expect(byPhone.data.items.map((user) => user.firstName)).toEqual(["Alice"]);

    const noSearch = await listUsers(1, 10, "firstName", "asc", "");
    expect(noSearch.ok).toBe(true);
    if (!noSearch.ok) return;
    expect(noSearch.data.items).toHaveLength(2);
  });
});

describe("getUser", () => {
  it("returns the matching user", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = await getUser(created.data.id);
    expect(result.ok).toBe(true);
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await getUser("missing-id");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("updateUser", () => {
  it("updates an existing user", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUser(created.data.id, {
      ...baseInput(userType.id),
      lastName: "Smith",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.lastName).toBe("Smith");
  });

  it("returns 404 for a nonexistent id", async () => {
    const userType = await createTestUserType();
    const result = await updateUser("missing-id", baseInput(userType.id));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("rejects updating to another user's email", async () => {
    const userType = await createTestUserType();
    const first = await createUser(baseInput(userType.id));
    if (!first.ok) throw new Error("setup failed");
    const second = await createUser({ ...baseInput(userType.id), email: "other@example.com" });
    if (!second.ok) throw new Error("setup failed");

    const result = await updateUser(second.data.id, {
      ...baseInput(userType.id),
      email: "jane@example.com",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
  });

  it("allows updating a user back to its own current email", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUser(created.data.id, baseInput(userType.id));
    expect(result.ok).toBe(true);
  });

  it("rejects an update with a bad typeId", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUser(created.data.id, {
      ...baseInput(userType.id),
      typeId: 999999,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it("preserves createdAt/createdBy/status while refreshing updatedAt/updatedBy", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = await updateUser(created.data.id, {
      ...baseInput(userType.id),
      lastName: "Smith",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.createdAt).toBe(created.data.createdAt);
    expect(result.data.createdBy).toBe(created.data.createdBy);
    expect(result.data.status).toBe(created.data.status);
    expect(result.data.updatedBy).toBe("system");
    expect(new Date(result.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.data.updatedAt).getTime(),
    );
  });

  it("returns 404 for a soft-deleted user", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    await deleteUser(created.data.id);
    const result = await updateUser(created.data.id, baseInput(userType.id));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("deleteUser", () => {
  it("deletes an existing user", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = await deleteUser(created.data.id);
    expect(result.ok).toBe(true);
  });

  it("returns 404 for a nonexistent id", async () => {
    const result = await deleteUser("missing-id");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("hides the user from getUser after deletion", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    await deleteUser(created.data.id);
    const result = await getUser(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("hides the user from listUsers after deletion", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    await deleteUser(created.data.id);
    const result = await listUsers();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items.some((user) => user.id === created.data.id)).toBe(false);
  });

  it("returns 404 when deleting an already-deleted user", async () => {
    const userType = await createTestUserType();
    const created = await createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    await deleteUser(created.data.id);
    const result = await deleteUser(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});
