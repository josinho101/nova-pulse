"use client";

import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { isAuthenticated } from "@/lib/auth-session";

const SIDEBAR_WIDTH = 248;
const SIDEBAR_WIDTH_COLLAPSED = 72;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  useEffect(() => {
    const ok = isAuthenticated();
    setAuthorized(ok);
    if (!ok) router.replace("/login");
  }, [router]);

  if (!authorized) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Header />
      <Sidebar
        width={sidebarWidth}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          p: 3,
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        <Breadcrumbs />
        {children}
      </Box>
    </Box>
  );
}
