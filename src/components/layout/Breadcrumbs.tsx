"use client";

import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

type Crumb = {
  labelKey: string;
  href: string;
};

const ROUTE_CRUMBS: Record<string, Crumb[]> = {
  "/": [],
  "/users": [{ labelKey: "users", href: "/users" }],
  "/users/new": [
    { labelKey: "users", href: "/users" },
    { labelKey: "addUser", href: "/users/new" },
  ],
  "/users/groups": [
    { labelKey: "users", href: "/users" },
    { labelKey: "groups", href: "/users/groups" },
  ],
  "/users/user-types": [
    { labelKey: "users", href: "/users" },
    { labelKey: "userTypes", href: "/users/user-types" },
  ],
};

const EDIT_USER_PATTERN = /^\/users\/[^/]+\/edit$/;

export function Breadcrumbs() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const crumbs =
    ROUTE_CRUMBS[pathname] ??
    (EDIT_USER_PATTERN.test(pathname)
      ? [
          { labelKey: "users", href: "/users" },
          { labelKey: "editUser", href: pathname },
        ]
      : undefined);

  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 2 }}
      aria-label="breadcrumb"
    >
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", color: "inherit", textDecoration: "none" }}
      >
        <HomeIcon fontSize="small" />
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return isLast ? (
          <Typography key={crumb.href} color="text.primary" variant="body2">
            {t(crumb.labelKey)}
          </Typography>
        ) : (
          <Link
            key={crumb.href}
            href={crumb.href}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Typography variant="body2" color="text.secondary">
              {t(crumb.labelKey)}
            </Typography>
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
