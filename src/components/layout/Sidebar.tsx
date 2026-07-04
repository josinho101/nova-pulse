"use client";

import { useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeIcon from "@mui/icons-material/Badge";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const TOP_LEVEL_ITEMS = [
  { key: "patients", href: "/patients", Icon: LocalHospitalIcon },
  { key: "doctors", href: "/doctors", Icon: MedicalServicesIcon },
  { key: "stock", href: "/stock", Icon: InventoryIcon },
  { key: "purchase", href: "/purchase", Icon: ShoppingCartIcon },
  { key: "reports", href: "/reports", Icon: AssessmentIcon },
  { key: "profile", href: "/profile", Icon: AccountCircleIcon },
] as const;

export function Sidebar({
  width,
  collapsed,
  onToggleCollapsed,
}: {
  width: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const t = useTranslations("Sidebar");
  const tCommon = useTranslations("Common");
  const pathname = usePathname();
  const isUsersSectionActive =
    pathname === "/users" ||
    pathname === "/users/roles-and-groups" ||
    pathname === "/users/user-types";
  const [usersOpen, setUsersOpen] = useState(isUsersSectionActive);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const usersButtonRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancelFlyoutClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
  };

  const scheduleFlyoutClose = () => {
    cancelFlyoutClose();
    closeTimeoutRef.current = setTimeout(() => setFlyoutOpen(false), 150);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        [`& .MuiDrawer-paper`]: {
          width,
          overflowX: "hidden",
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            color="primary"
            sx={{ fontWeight: 800 }}
          >
            {tCommon("appName")}
          </Typography>
        )}
        <Tooltip title={collapsed ? t("expand") : t("collapse")}>
          <IconButton
            onClick={onToggleCollapsed}
            aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            size="small"
            color="inherit"
          >
            {collapsed ? (
              <ArrowForwardIosIcon fontSize="small" />
            ) : (
              <ArrowBackIosNewIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Toolbar>
      <List sx={{ px: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <ListItemButton
          component={Link}
          href="/"
          selected={pathname === "/"}
          sx={{
            borderRadius: 1,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 36,
              color: pathname === "/" ? "primary.main" : undefined,
              justifyContent: "center",
            }}
          >
            <DashboardIcon />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={t("dashboard")}
              slotProps={{
                primary: {
                  sx: {
                    fontWeight: pathname === "/" ? 600 : 400,
                    color: pathname === "/" ? "primary.main" : undefined,
                  },
                },
              }}
            />
          )}
        </ListItemButton>

        <Box
          ref={usersButtonRef}
          onMouseEnter={() => {
            if (collapsed) {
              cancelFlyoutClose();
              setFlyoutOpen(true);
            }
          }}
          onMouseLeave={() => collapsed && scheduleFlyoutClose()}
        >
          <ListItemButton
            onClick={() => !collapsed && setUsersOpen((prev) => !prev)}
            sx={{
              borderRadius: 1,
              justifyContent: collapsed ? "center" : "flex-start",
              ...(collapsed &&
                flyoutOpen && {
                  bgcolor: "action.hover",
                }),
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 36,
                justifyContent: "center",
              }}
            >
              <PeopleAltIcon />
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText primary={t("users")} />
                {usersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </>
            )}
          </ListItemButton>
          <Collapse in={usersOpen && !collapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={Link}
                href="/users"
                selected={pathname === "/users"}
                sx={{ borderRadius: 1, pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FormatListBulletedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t("usersList")} />
              </ListItemButton>
              <ListItemButton
                component={Link}
                href="/users/roles-and-groups"
                selected={pathname === "/users/roles-and-groups"}
                sx={{ borderRadius: 1, pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <GroupsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t("rolesAndGroups")} />
              </ListItemButton>
              <ListItemButton
                component={Link}
                href="/users/user-types"
                selected={pathname === "/users/user-types"}
                sx={{ borderRadius: 1, pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <BadgeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t("userTypes")} />
              </ListItemButton>
            </List>
          </Collapse>
        </Box>

        {collapsed && (
          <Popper
            open={flyoutOpen}
            anchorEl={usersButtonRef.current}
            placement="right-start"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Paper
              elevation={4}
              onMouseEnter={cancelFlyoutClose}
              onMouseLeave={scheduleFlyoutClose}
              sx={{ position: "relative", ml: 1.0, minWidth: 200, py: 0.5, overflow: "visible" }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: -6,
                  width: 12,
                  height: 12,
                  bgcolor: "inherit",
                  backgroundImage: "inherit",
                  transform: "rotate(45deg)",
                  clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                }}
              />
              <Typography
                variant="caption"
                sx={{ px: 2, py: 0.5, display: "block", color: "text.secondary", fontWeight: 600 }}
              >
                {t("users")}
              </Typography>
              <List component="div" disablePadding>
                <ListItemButton
                  component={Link}
                  href="/users"
                  selected={pathname === "/users"}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FormatListBulletedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("usersList")} />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  href="/users/roles-and-groups"
                  selected={pathname === "/users/roles-and-groups"}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <GroupsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("rolesAndGroups")} />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  href="/users/user-types"
                  selected={pathname === "/users/user-types"}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <BadgeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("userTypes")} />
                </ListItemButton>
              </List>
            </Paper>
          </Popper>
        )}

        {TOP_LEVEL_ITEMS.map(({ key, href, Icon }) => (
          <ListItemButton
            key={href}
            component={Link}
            href={href}
            selected={pathname === href}
            sx={{
              borderRadius: 1,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 36,
                color: pathname === href ? "primary.main" : undefined,
                justifyContent: "center",
              }}
            >
              <Icon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={t(key)}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: pathname === href ? 600 : 400,
                      color: pathname === href ? "primary.main" : undefined,
                    },
                  },
                }}
              />
            )}
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
