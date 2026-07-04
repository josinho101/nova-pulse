import { beforeEach, describe, expect, it } from "vitest";
import {
  createUserType,
  deleteUserType,
  getUserType,
  listUserTypes,
  updateUserType,
} from "./user-type.controller";
import { resetForTests as resetUserTypes } from "@/server/store/user-type.store";
import { addUser, resetForTests as resetUsers } from "@/server/store/user.store";

beforeEach(() => {
  resetUserTypes();
  resetUsers();
});

describe("createUserType", () => {
  it("creates a user type with a generated id", () => {
    const result = createUserType({ name: "Admin" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Admin");
    expect(result.data.id).toBeTruthy();
  });

  it("rejects an empty name", () => {
    const result = createUserType({ name: "" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("rejects a name longer than 20 characters", () => {
    const result = createUserType({ name: "a".repeat(21) });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("rejects a duplicate active name", () => {
    createUserType({ name: "Admin" });
    const result = createUserType({ name: "Admin" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("allows reusing the name of a soft-deleted user type", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    deleteUserType(created.data.id);
    const result = createUserType({ name: "Admin" });

    expect(result.ok).toBe(true);
  });

  it("populates audit fields and defaults status to active", () => {
    const result = createUserType({ name: "Admin" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe(1);
    expect(result.data.createdBy).toBe("system");
    expect(result.data.updatedBy).toBe("system");
    expect(result.data.createdAt).toBe(result.data.updatedAt);
    expect(new Date(result.data.createdAt).toISOString()).toBe(result.data.createdAt);
  });

  it("ignores client-supplied status/audit fields", () => {
    const result = createUserType({
      name: "Admin",
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

describe("getUserType", () => {
  it("returns the matching user type", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = getUserType(created.data.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe(created.data.id);
  });

  it("returns 404 for a nonexistent id", () => {
    const result = getUserType(999999);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("updateUserType", () => {
  it("updates an existing user type", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = updateUserType(created.data.id, { name: "Super Admin" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.name).toBe("Super Admin");
  });

  it("returns 404 for a nonexistent id", () => {
    const result = updateUserType(999999, { name: "Whatever" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("returns 400 for an invalid body", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = updateUserType(created.data.id, { name: "" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it("rejects a name longer than 20 characters", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = updateUserType(created.data.id, { name: "a".repeat(21) });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it("allows saving with its own unchanged name", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = updateUserType(created.data.id, { name: "Admin" });
    expect(result.ok).toBe(true);
  });

  it("rejects renaming to another active user type's name", () => {
    const first = createUserType({ name: "Admin" });
    const second = createUserType({ name: "Manager" });
    if (!first.ok || !second.ok) throw new Error("setup failed");

    const result = updateUserType(second.data.id, { name: "Admin" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "name")).toBe(true);
  });

  it("preserves createdAt/createdBy/status while refreshing updatedAt/updatedBy", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = updateUserType(created.data.id, { name: "Super Admin" });
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

  it("returns 404 for a soft-deleted user type", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    deleteUserType(created.data.id);
    const result = updateUserType(created.data.id, { name: "Whatever" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});

describe("deleteUserType", () => {
  it("deletes an unreferenced user type", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = deleteUserType(created.data.id);
    expect(result.ok).toBe(true);
  });

  it("hides the user type from getUserType after deletion", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    deleteUserType(created.data.id);
    const result = getUserType(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("hides the user type from listUserTypes after deletion", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    deleteUserType(created.data.id);
    const result = listUserTypes();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.some((userType) => userType.id === created.data.id)).toBe(false);
  });

  it("returns 404 when deleting an already-deleted user type", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    deleteUserType(created.data.id);
    const result = deleteUserType(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("blocks deletion when referenced by a user", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    addUser({
      id: "user-1",
      firstName: "Jane",
      lastName: "Doe",
      dob: "1990-01-01",
      address: "123 Main St",
      email: "jane@example.com",
      typeId: created.data.id,
    });

    const result = deleteUserType(created.data.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
  });

  it("returns 404 for a nonexistent id", () => {
    const result = deleteUserType(999999);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});
