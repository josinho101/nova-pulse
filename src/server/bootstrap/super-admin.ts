import bcrypt from "bcrypt";
import { superAdminConfig } from "@/server/config/super-admin";
import { addUser, findUserByTypeId, setUserActor } from "@/server/store/user.store";
import { createUserLogin } from "@/server/store/user-login.store";
import { SUPER_ADMIN_USER_TYPE_ID, setUserTypeActor } from "@/server/store/user-type.store";

const BCRYPT_SALT_ROUNDS = 10;

export async function ensureSuperAdmin(): Promise<void> {
  const existing = await findUserByTypeId(SUPER_ADMIN_USER_TYPE_ID);
  if (existing) return;

  if (!superAdminConfig.username || !superAdminConfig.password) {
    throw new Error(
      "SUPER_ADMIN_USERNAME and SUPER_ADMIN_PASSWORD must be set to bootstrap the Super Admin account",
    );
  }

  // No authenticated actor exists yet — create the row with a null actor,
  // then self-reference it once its id is known.
  const user = await addUser(
    {
      firstName: superAdminConfig.firstName,
      lastName: superAdminConfig.lastName,
      typeId: SUPER_ADMIN_USER_TYPE_ID,
    },
    null,
  );
  await setUserActor(user.id, user.id);
  await setUserTypeActor(SUPER_ADMIN_USER_TYPE_ID, user.id);

  const passwordHash = await bcrypt.hash(superAdminConfig.password, BCRYPT_SALT_ROUNDS);
  await createUserLogin({
    userId: user.id,
    username: superAdminConfig.username,
    passwordHash,
    forcePasswordChange: false,
  });
}
