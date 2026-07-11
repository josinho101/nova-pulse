"use client";

import { useEffect, useState, type MouseEvent } from "react";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { clearSession, getStoredUser } from "@/lib/auth-session";
import { getUser } from "@/lib/users-api";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(
    () => getStoredUser()?.username ?? null,
  );
  const [initials, setInitials] = useState<string | null>(null);
  const open = Boolean(anchorEl);
  const t = useTranslations("UserMenu");
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;

    let cancelled = false;
    getUser(stored.id).then((result) => {
      if (cancelled || !result.ok) return;
      const { firstName, lastName } = result.data;
      setDisplayName(`${firstName} ${lastName}`);
      setInitials(getInitials(firstName, lastName));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    router.push("/profile");
  };

  const handleSignOut = () => {
    clearSession();
    handleClose();
    router.push("/login");
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label={t("accountMenuAria")} size="small">
        <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem" }}>
          {initials ?? <PersonIcon fontSize="small" />}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 260,
              mt: 1.5,
              overflow: "visible",
              "--Paper-overlay": "none !important",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -6,
                right: 14,
                width: 12,
                height: 12,
                bgcolor: "background.paper",
                transform: "rotate(45deg)",
                borderTop: "1px solid",
                borderLeft: "1px solid",
                borderColor: "divider",
              },
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 2,
          }}
        >
          <Avatar sx={{ width: 64, height: 64, fontSize: "1.5rem" }}>
            {initials ?? <PersonIcon fontSize="large" />}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {displayName}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("profile")}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("signOut")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
