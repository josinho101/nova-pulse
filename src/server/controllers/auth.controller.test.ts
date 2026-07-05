// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { login } from "./auth.controller";
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
const {
  resetForTests: resetUserLogins,
  createUserLogin,
  setUserLoginStatus,
} = await import("@/server/store/user-login.store");

beforeEach(async () => {
  await resetUsers();
  await resetUserTypes();
  await resetUserLogins();
});

async function createTestUser() {
  const userType = await createUserType({ name: "Admin" });
  if (!userType.ok) throw new Error("setup failed");

  const user = await createUser({
    firstName: "Jane",
    lastName: "Doe",
    dob: "1990-01-01",
    address: "123 Main St",
    email: "jane@example.com",
    typeId: userType.data.id,
  });
  if (!user.ok) throw new Error("setup failed");
  return user.data;
}

async function createTestLogin(userId: string, password: string, forcePasswordChange = false) {
  const passwordHash = await bcrypt.hash(password, 10);
  return createUserLogin({
    userId,
    username: "jane.doe",
    passwordHash,
    forcePasswordChange,
  });
}

describe("login", () => {
  it("succeeds with correct username and password", async () => {
    const user = await createTestUser();
    await createTestLogin(user.id, "correct-password");

    const result = await login({ username: "jane.doe", password: "correct-password" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.token).toBeTruthy();
    expect(result.data.user).toEqual({
      id: user.id,
      username: "jane.doe",
      forcePasswordChange: false,
    });
  });

  it("rejects an incorrect password", async () => {
    const user = await createTestUser();
    await createTestLogin(user.id, "correct-password");

    const result = await login({ username: "jane.doe", password: "wrong-password" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(401);
  });

  it("rejects an unknown username", async () => {
    const result = await login({ username: "nobody", password: "whatever" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(401);
  });

  it("rejects login for disabled credentials", async () => {
    const user = await createTestUser();
    const created = await createTestLogin(user.id, "correct-password");
    await setUserLoginStatus(created.id, 2);

    const result = await login({ username: "jane.doe", password: "correct-password" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(401);
  });

  it("rejects missing username/password with a validation error", async () => {
    const result = await login({ username: "", password: "" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.fields?.some((field) => field.path === "username")).toBe(true);
    expect(result.fields?.some((field) => field.path === "password")).toBe(true);
  });

  it("reflects forcePasswordChange from the credentials record", async () => {
    const user = await createTestUser();
    await createTestLogin(user.id, "correct-password", true);

    const result = await login({ username: "jane.doe", password: "correct-password" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.user.forcePasswordChange).toBe(true);
  });
});
