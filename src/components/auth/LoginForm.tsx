"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/common/Toast";
import { login } from "@/lib/auth-api";
import { isAuthenticated, storeSession } from "@/lib/auth-session";

interface FieldErrors {
  username?: string;
  password?: string;
}

const KNOWN_FIELDS = ["username", "password"] as const;

export function LoginForm() {
  const t = useTranslations("LoginForm");
  const router = useRouter();
  const { notify, toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [alreadyAuthenticated] = useState(() => isAuthenticated());

  useEffect(() => {
    if (alreadyAuthenticated) router.replace("/");
  }, [alreadyAuthenticated, router]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();

    const errors: FieldErrors = {};
    if (!trimmedUsername) errors.username = t("usernameRequired");
    if (!password) errors.password = t("passwordRequired");

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    const result = await login({ username: trimmedUsername, password });

    setSubmitting(false);

    if (result.ok) {
      storeSession(result.data.token, result.data.user);
      router.push("/");
      return;
    }

    const nextFieldErrors: FieldErrors = {};
    for (const field of result.fields ?? []) {
      if ((KNOWN_FIELDS as readonly string[]).includes(field.path)) {
        nextFieldErrors[field.path as (typeof KNOWN_FIELDS)[number]] = field.message;
      }
    }

    setFieldErrors(nextFieldErrors);
    notify(result.fields?.[0]?.message ?? result.message, "error");
  };

  if (alreadyAuthenticated) return null;

  return (
    <>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          id="username"
          name="username"
          label={t("usernameLabel")}
          autoComplete="username"
          fullWidth
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            clearFieldError("username");
          }}
          error={!!fieldErrors.username}
          helperText={fieldErrors.username ?? " "}
          disabled={submitting}
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label={t("passwordLabel")}
          autoComplete="current-password"
          fullWidth
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password ?? " "}
          disabled={submitting}
        />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <FormControlLabel control={<Checkbox size="small" />} label={t("rememberMe")} />
          <Link href="#" style={{ fontSize: 14 }}>
            {t("forgotPassword")}
          </Link>
        </Box>

        <Button type="submit" variant="contained" size="large" fullWidth loading={submitting}>
          {t("signIn")}
        </Button>
      </Box>

      {toast}
    </>
  );
}
