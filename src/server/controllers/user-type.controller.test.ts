import { beforeEach, describe, expect, it } from "vitest";
import {
  createUserType,
  deleteUserType,
  getUserType,
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
});

describe("deleteUserType", () => {
  it("deletes an unreferenced user type", () => {
    const created = createUserType({ name: "Admin" });
    if (!created.ok) throw new Error("setup failed");

    const result = deleteUserType(created.data.id);
    expect(result.ok).toBe(true);
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
