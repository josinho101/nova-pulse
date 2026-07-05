import type { z } from "zod";
import type { ApiFieldError } from "@/server/http/api-response";

export function toFieldErrors(error: z.ZodError): ApiFieldError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
