"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useColorScheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const t = useTranslations("ThemeToggle");

  if (!mode) {
    return null;
  }

  const isDark = mode === "dark";

  return (
    <Tooltip title={t("switchTheme")}>
      <IconButton
        onClick={() => setMode(isDark ? "light" : "dark")}
        aria-label={t("toggleThemeAria")}
        color="inherit"
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
