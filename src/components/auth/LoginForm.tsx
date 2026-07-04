"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function LoginForm() {
  const t = useTranslations("LoginForm");

  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        id="email"
        name="email"
        type="email"
        label={t("emailLabel")}
        autoComplete="email"
        fullWidth
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label={t("passwordLabel")}
        autoComplete="current-password"
        fullWidth
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <FormControlLabel control={<Checkbox size="small" />} label={t("rememberMe")} />
        <Link href="#" style={{ fontSize: 14 }}>
          {t("forgotPassword")}
        </Link>
      </Box>

      <Button type="submit" variant="contained" size="large" fullWidth>
        {t("signIn")}
      </Button>
    </Box>
  );
}
