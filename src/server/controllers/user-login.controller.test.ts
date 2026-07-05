import { beforeEach, describe, expect, it, vi } from "vitest";
import { disableUserLogin, getUserLoginSummary, upsertUserLogin } from "./user-login.controller";
import { createUser } from "./user.controller";
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

vi.mock("@/server/store/user-login.store", async () => {
  const actual = await vi.importActual<typeof import("@/server/store/user-login.store")>(
    "@/server/store/user-login.store",
  );
  const fake = await import("@/server/store/user-login.store.fake");

  return {
    ...actual,
    resetForTests: fake.resetForTests,
    findByUsername: fake.findByUsername,
    getByUserId: fake.getByUserId,
    createUserLogin: fake.createUserLogin,
    updateUserLogin: fake.updateUserLogin,
    setUserLoginStatus: fake.setUserLoginStatus,
    deleteUserLoginByUser: fake.deleteUserLoginByUser,
  };
});

const { resetForTests: resetUsers } = await import("@/server/store/user.store");
const { resetForTests: resetUserTypes } = await import("@/server/store/user-type.store");
const { resetForTests: resetUserLogins } = await import("@/server/store/user-login.store");

beforeEach(async () => {
  await resetUsers();
  await resetUserTypes();
  await resetUserLogins();
  testUserTypeId = undefined;
});

let testUserTypeId: number | undefined;

async function ensureTestUserType(): Promise<number> {
  if (testUserTypeId !== undefined) return testUserTypeId;
  const userType = await createUserType({ name: "Admin" });
  if (!userType.ok) throw new Error("setup failed");
  testUserTypeId = userType.data.id;
  return testUserTypeId;
}

async function createTestUser(email = "jane@example.com") {
  const typeId = await ensureTestUserType();

  const user = await createUser({
    firstName: "Jane",
    lastName: "Doe",
    dob: "1990-01-01",
    address: "123 Main St",
    email,
    typeId,
  });
  if (!user.ok) throw new Error("setup failed");
  return user.data;
}

describe("upsertUserLogin", () => {
  it("creates login credentials for a user", async () => {
    const user = await createTestUser();

    const result = await upsertUserLogin(user.id, {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.username).toBe("jane.doe");
    expect(result.data.forcePasswordChange).toBe(false);
  });

  it("returns 404 for a nonexistent user", async () => {
    const result = await upsertUserLogin("missing-id", {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });

  it("requires a password when creating for the first time", async () => {
    const user = await createTestUser();

    const result = await upsertUserLogin(user.id, {
      username: "jane.doe",
      forcePasswordChange: false,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "password")).toBe(true);
  });

  it("rejects a password shorter than the minimum length", async () => {
    const user = await createTestUser();

    const result = await upsertUserLogin(user.id, {
      username: "jane.doe",
      password: "short",
      forcePasswordChange: false,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "password")).toBe(true);
  });

  it("rejects a duplicate username used by another user", async () => {
    const first = await createTestUser("first@example.com");
    const second = await createTestUser("second@example.com");

    await upsertUserLogin(first.id, {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });

    const result = await upsertUserLogin(second.id, {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.fields?.some((field) => field.path === "username")).toBe(true);
  });

  it("allows updating a user's login back to its own current username", async () => {
    const user = await createTestUser();

    await upsertUserLogin(user.id, {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });

    const result = await upsertUserLogin(user.id, {
      username: "jane.doe",
      forcePasswordChange: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.forcePasswordChange).toBe(true);
  });

  it("allows omitting password on update to keep the current password", async () => {
    const user = await createTestUser();

    const created = await upsertUserLogin(user.id, {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });
    expect(created.ok).toBe(true);

    const updated = await upsertUserLogin(user.id, {
      username: "jane.doe.updated",
      forcePasswordChange: false,
    });

    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.data.username).toBe("jane.doe.updated");
  });
});

describe("getUserLoginSummary", () => {
  it("returns null when no login credentials exist", async () => {
    const user = await createTestUser();

    const result = await getUserLoginSummary(user.id);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toBeNull();
  });

  it("returns the summary when login credentials exist", async () => {
    const user = await createTestUser();
    await upsertUserLogin(user.id, {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });

    const result = await getUserLoginSummary(user.id);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data?.username).toBe("jane.doe");
  });
});

describe("disableUserLogin", () => {
  it("disables existing login credentials", async () => {
    const user = await createTestUser();
    await upsertUserLogin(user.id, {
      username: "jane.doe",
      password: "password123",
      forcePasswordChange: false,
    });

    const result = await disableUserLogin(user.id);
    expect(result.ok).toBe(true);

    const summary = await getUserLoginSummary(user.id);
    expect(summary.ok).toBe(true);
    if (!summary.ok) return;
    expect(summary.data).toBeNull();
  });

  it("returns 404 when no login credentials exist", async () => {
    const user = await createTestUser();

    const result = await disableUserLogin(user.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(404);
  });
});
