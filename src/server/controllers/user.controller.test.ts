import { beforeEach, describe, expect, it } from "vitest";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "./user.controller";
import { resetForTests as resetUsers } from "@/server/store/user.store";
import { resetForTests as resetUserTypes } from "@/server/store/user-type.store";
import { createUserType } from "./user-type.controller";

beforeEach(() => {
  resetUsers();
  resetUserTypes();
});

function createTestUserType() {
  const result = createUserType({ name: "Admin" });
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
  it("creates a user with a generated id", () => {
    const userType = createTestUserType();
    const result = createUser(baseInput(userType.id));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBeTruthy();
    expect(result.data.email).toBe("jane@example.com");
  });

  it("succeeds without middleName since it is optional", () => {
    const userType = createTestUserType();
    const result = createUser(baseInput(userType.id));

    expect(result.ok).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const userType = createTestUserType();
    const result = createUser({ ...baseInput(userType.id), email: "not-an-email" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "email")).toBe(true);
  });

  it("rejects a missing required field", () => {
    const userType = createTestUserType();
    const input = baseInput(userType.id) as Record<string, unknown>;
    delete input.firstName;

    const result = createUser(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "firstName")).toBe(true);
  });

  it("rejects a typeId that does not reference an existing UserType", () => {
    const result = createUser(baseInput(999999));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "typeId")).toBe(true);
  });

  it("rejects a duplicate email", () => {
    const userType = createTestUserType();
    createUser(baseInput(userType.id));

    const result = createUser(baseInput(userType.id));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "email")).toBe(true);
  });

  it("populates audit fields and defaults status to active", () => {
    const userType = createTestUserType();
    const result = createUser(baseInput(userType.id));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe(1);
    expect(result.data.createdBy).toBe("system");
    expect(result.data.updatedBy).toBe("system");
    expect(result.data.createdAt).toBe(result.data.updatedAt);
    expect(new Date(result.data.createdAt).toISOString()).toBe(result.data.createdAt);
  });

  it("ignores client-supplied status/audit fields", () => {
    const userType = createTestUserType();
    const result = createUser({
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
  it("defaults to page 1 with a page size of 10", () => {
    const userType = createTestUserType();
    for (let i = 0; i < 15; i++) {
      createUser({ ...baseInput(userType.id), email: `user${i}@example.com` });
    }

    const result = listUsers();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.page).toBe(1);
    expect(result.data.pageSize).toBe(10);
    expect(result.data.total).toBe(15);
    expect(result.data.items).toHaveLength(10);
  });

  it("returns the requested page", () => {
    const userType = createTestUserType();
    for (let i = 0; i < 15; i++) {
      createUser({ ...baseInput(userType.id), email: `user${i}@example.com` });
    }

    const result = listUsers(2, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.page).toBe(2);
    expect(result.data.items).toHaveLength(5);
  });

  it("sorts by lastName according to sortOrder", () => {
    const userType = createTestUserType();
    createUser({ ...baseInput(userType.id), lastName: "Zeta", email: "zeta@example.com" });
    createUser({ ...baseInput(userType.id), lastName: "Alpha", email: "alpha@example.com" });

    const ascending = listUsers(1, 10, "asc");
    expect(ascending.ok).toBe(true);
    if (!ascending.ok) return;
    expect(ascending.data.items.map((user) => user.lastName)).toEqual(["Alpha", "Zeta"]);

    const descending = listUsers(1, 10, "desc");
    expect(descending.ok).toBe(true);
    if (!descending.ok) return;
    expect(descending.data.items.map((user) => user.lastName)).toEqual(["Zeta", "Alpha"]);
  });

  it("falls back to defaults for invalid page/pageSize values", () => {
    const userType = createTestUserType();
    createUser(baseInput(userType.id));

    const result = listUsers(0, -5);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.page).toBe(1);
    expect(result.data.pageSize).toBe(10);
  });
});

describe("getUser", () => {
  it("returns the matching user", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = getUser(created.data.id);
    expect(result.ok).toBe(true);
  });

  it("returns 404 for a nonexistent id", () => {
    const result = getUser("missing-id");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("updateUser", () => {
  it("updates an existing user", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = updateUser(created.data.id, {
      ...baseInput(userType.id),
      lastName: "Smith",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.lastName).toBe("Smith");
  });

  it("returns 404 for a nonexistent id", () => {
    const userType = createTestUserType();
    const result = updateUser("missing-id", baseInput(userType.id));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("rejects updating to another user's email", () => {
    const userType = createTestUserType();
    const first = createUser(baseInput(userType.id));
    if (!first.ok) throw new Error("setup failed");
    const second = createUser({ ...baseInput(userType.id), email: "other@example.com" });
    if (!second.ok) throw new Error("setup failed");

    const result = updateUser(second.data.id, {
      ...baseInput(userType.id),
      email: "jane@example.com",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
  });

  it("allows updating a user back to its own current email", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = updateUser(created.data.id, baseInput(userType.id));
    expect(result.ok).toBe(true);
  });

  it("rejects an update with a bad typeId", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = updateUser(created.data.id, {
      ...baseInput(userType.id),
      typeId: 999999,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it("preserves createdAt/createdBy/status while refreshing updatedAt/updatedBy", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = updateUser(created.data.id, {
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

  it("returns 404 for a soft-deleted user", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    deleteUser(created.data.id);
    const result = updateUser(created.data.id, baseInput(userType.id));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("deleteUser", () => {
  it("deletes an existing user", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    const result = deleteUser(created.data.id);
    expect(result.ok).toBe(true);
  });

  it("returns 404 for a nonexistent id", () => {
    const result = deleteUser("missing-id");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("hides the user from getUser after deletion", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    deleteUser(created.data.id);
    const result = getUser(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("hides the user from listUsers after deletion", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    deleteUser(created.data.id);
    const result = listUsers();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items.some((user) => user.id === created.data.id)).toBe(false);
  });

  it("returns 404 when deleting an already-deleted user", () => {
    const userType = createTestUserType();
    const created = createUser(baseInput(userType.id));
    if (!created.ok) throw new Error("setup failed");

    deleteUser(created.data.id);
    const result = deleteUser(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});
