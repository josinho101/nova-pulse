import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Header({ sidebarWidth }: { sidebarWidth: number }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        width: `calc(100% - ${sidebarWidth}px)`,
        ml: `${sidebarWidth}px`,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Box sx={{ flexGrow: 1 }} />
        <ThemeToggle />
        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}
