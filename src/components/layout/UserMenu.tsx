"use client";

import { useState, type MouseEvent } from "react";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PersonIcon from "@mui/icons-material/Person";
import { useTranslations } from "next-intl";

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const t = useTranslations("UserMenu");

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label={t("accountMenuAria")} size="small">
        <Avatar sx={{ width: 32, height: 32 }}>
          <PersonIcon fontSize="small" />
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleClose}>{t("profile")}</MenuItem>
        <MenuItem onClick={handleClose}>{t("signOut")}</MenuItem>
      </Menu>
    </>
  );
}
