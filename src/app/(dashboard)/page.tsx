import Typography from "@mui/material/Typography";

export default function DashboardHomePage() {
  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Nova Pulse
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Welcome back. Here is a quick overview of your pharmacy operations.
      </Typography>
    </>
  );
}
