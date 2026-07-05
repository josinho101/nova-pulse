import { z } from "zod";
import bcrypt from "bcrypt";
import {
  createUserLogin,
  findByUsername,
  getByUserId,
  setUserLoginStatus,
  updateUserLogin,
} from "@/server/store/user-login.store";
import { getUserById } from "@/server/store/user.store";
import { RECORD_STATUS } from "@/server/store/record-status";
import { ApiResult, fail, ok } from "@/server/http/api-response";
import { toFieldErrors } from "@/server/http/validation";

const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_COST_FACTOR = 10;

export const userLoginInputSchema = z.object({
  username: z.string().trim().min(1, "username is required"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .optional(),
  forcePasswordChange: z.boolean(),
});

export type UserLoginInput = z.infer<typeof userLoginInputSchema>;

export interface UserLoginSummary {
  id: string;
  username: string;
  forcePasswordChange: boolean;
}

export async function getUserLoginSummary(
  userId: string,
): Promise<ApiResult<UserLoginSummary | null>> {
  const login = await getByUserId(userId);
  if (!login) return ok(null);
  return ok({ id: login.id, username: login.username, forcePasswordChange: login.forcePasswordChange });
}

export async function upsertUserLogin(
  userId: string,
  input: unknown,
): Promise<ApiResult<UserLoginSummary>> {
  const user = await getUserById(userId);
  if (!user || user.status !== RECORD_STATUS.ACTIVE) return fail(404, "User not found");

  const parsed = userLoginInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  const existing = await getByUserId(userId);
  if (!existing && !parsed.data.password) {
    return fail(400, "Validation failed", [
      { path: "password", message: "password is required" },
    ]);
  }

  const conflict = await findByUsername(parsed.data.username);
  if (conflict && conflict.userId !== userId) {
    return fail(409, "Conflict", [{ path: "username", message: "Username is already in use" }]);
  }

  const passwordHash = parsed.data.password
    ? await bcrypt.hash(parsed.data.password, BCRYPT_COST_FACTOR)
    : null;

  const saved = existing
    ? await updateUserLogin(existing.id, {
        username: parsed.data.username,
        passwordHash,
        forcePasswordChange: parsed.data.forcePasswordChange,
      })
    : await createUserLogin({
        userId,
        username: parsed.data.username,
        passwordHash,
        forcePasswordChange: parsed.data.forcePasswordChange,
      });

  return ok({
    id: saved!.id,
    username: saved!.username,
    forcePasswordChange: saved!.forcePasswordChange,
  });
}

export async function disableUserLogin(userId: string): Promise<ApiResult<null>> {
  const existing = await getByUserId(userId);
  if (!existing) return fail(404, "Login credentials not found");

  await setUserLoginStatus(existing.id, RECORD_STATUS.DELETED);
  return ok(null);
}
