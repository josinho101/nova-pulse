import { beforeEach, describe, expect, it } from "vitest";
import { createUser, deleteUser, getUser, updateUser } from "./user.controller";
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
});
