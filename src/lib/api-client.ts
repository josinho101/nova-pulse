import { clearSession, getStoredToken } from "@/lib/auth-session";

export interface ApiFieldError {
  path: string;
  message: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; fields?: ApiFieldError[] };

export async function apiRequest<T>(input: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const token = getStoredToken();
    const response = await fetch(input, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        clearSession();
        window.location.href = "/login";
      }

      return {
        ok: false,
        status: response.status,
        message: json?.error?.message ?? "Request failed",
        fields: json?.error?.fields,
      };
    }

    return { ok: true, data: json?.data as T };
  } catch {
    return { ok: false, status: 0, message: "Network error" };
  }
}
