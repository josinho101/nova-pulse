export interface ApiFieldError {
  path: string;
  message: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; fields?: ApiFieldError[] };

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function fail(status: number, message: string, fields?: ApiFieldError[]): ApiResult<never> {
  return { ok: false, status, message, fields };
}
