"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useColorScheme } from "@mui/material/styles";

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme();

  if (!mode) {
    return null;
  }

  const isDark = mode === "dark";

  return (
    <Tooltip title="Switch theme">
      <IconButton
        onClick={() => setMode(isDark ? "light" : "dark")}
        aria-label="Toggle light and dark theme"
        color="inherit"
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
