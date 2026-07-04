import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export function Sidebar({
  width,
  collapsed,
  onToggleCollapsed,
}: {
  width: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
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
            Nova Pulse
          </Typography>
        )}
        <Tooltip title={collapsed ? "Expand" : "Collapse"}>
          <IconButton
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
      <List sx={{ px: 1 }}>
        <ListItemButton
          selected
          sx={{
            borderRadius: 1,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 36,
              color: "primary.main",
              justifyContent: "center",
            }}
          >
            <DashboardIcon />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Dashboard"
              slotProps={{
                primary: { sx: { fontWeight: 600, color: "primary.main" } },
              }}
            />
          )}
        </ListItemButton>
      </List>
    </Drawer>
  );
}
