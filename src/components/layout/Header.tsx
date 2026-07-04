import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Header() {
  const tCommon = useTranslations("Common");

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        width: "100%",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          color="primary"
          sx={{ fontWeight: 800, flexShrink: 0, mr: 2, fontSize: "1.75rem"}}
        >
          {tCommon("appName")}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <ThemeToggle />
        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}
