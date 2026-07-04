import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          px: 3,
          py: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
            Nova Pulse
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
            Sign In
          </Typography>

          <LoginForm />

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              or sign in with
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" fullWidth>
              Google
            </Button>
            <Button variant="outlined" fullWidth>
              Facebook
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Don&apos;t have an account? <Link href="#">Create an account</Link>
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" }, bgcolor: "primary.main" }} />
    </Box>
  );
}
