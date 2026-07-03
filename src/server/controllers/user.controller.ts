import { z } from "zod";
import {
  addUser,
  deleteUser as deleteUserRecord,
  findUserByEmail,
  getUserById,
  listUsers as listUserRecords,
  updateUser as updateUserRecord,
} from "@/server/store/user.store";
import { userTypeExists } from "@/server/store/user-type.store";
import { ApiResult, fail, ok } from "@/server/http/api-response";

export const userInputSchema = z.object({
  firstName: z.string().trim().min(1, "firstName is required"),
  lastName: z.string().trim().min(1, "lastName is required"),
  middleName: z.string().trim().min(1).optional(),
  dob: z.iso.date("dob must be a valid ISO date (YYYY-MM-DD)"),
  address: z.string().trim().min(1, "address is required"),
  email: z.email("email must be a valid email address"),
  typeId: z.number().int("typeId must be an integer"),
});

export type UserInput = z.infer<typeof userInputSchema>;

export interface User extends UserInput {
  id: string;
}

function toFieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function listUsers(): ApiResult<User[]> {
  return ok(listUserRecords());
}

export function getUser(id: string): ApiResult<User> {
  const user = getUserById(id);
  if (!user) return fail(404, "User not found");
  return ok(user);
}

export function createUser(input: unknown): ApiResult<User> {
  const parsed = userInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (!userTypeExists(parsed.data.typeId)) {
    return fail(400, "Validation failed", [
      { path: "typeId", message: "Referenced UserType does not exist" },
    ]);
  }

  if (findUserByEmail(parsed.data.email)) {
    return fail(409, "Conflict", [{ path: "email", message: "Email is already in use" }]);
  }

  const created: User = { id: crypto.randomUUID(), ...parsed.data };
  addUser(created);
  return ok(created);
}

export function updateUser(id: string, input: unknown): ApiResult<User> {
  if (!getUserById(id)) return fail(404, "User not found");

  const parsed = userInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "Validation failed", toFieldErrors(parsed.error));
  }

  if (!userTypeExists(parsed.data.typeId)) {
    return fail(400, "Validation failed", [
      { path: "typeId", message: "Referenced UserType does not exist" },
    ]);
  }

  if (findUserByEmail(parsed.data.email, id)) {
    return fail(409, "Conflict", [{ path: "email", message: "Email is already in use" }]);
  }

  const updated: User = { id, ...parsed.data };
  updateUserRecord(id, updated);
  return ok(updated);
}

export function deleteUser(id: string): ApiResult<null> {
  if (!getUserById(id)) return fail(404, "User not found");
  deleteUserRecord(id);
  return ok(null);
}
