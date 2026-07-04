import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const t = await getTranslations("LoginPage");
  const tCommon = await getTranslations("Common");

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.paper",
        overflow: "hidden",
        px: 3,
        py: 6,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          color: "primary.main",
          bgcolor: "currentcolor",
          maskImage: "url(/images/pharmacy-background.svg)",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "cover",
          WebkitMaskImage: "url(/images/pharmacy-background.svg)",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "cover",
          opacity: 0.5,
        }}
      />
      <Box sx={{ position: "relative", width: "100%", maxWidth: 360 }}>
        <Typography variant="h3" color="primary" sx={{ fontWeight: 800 }}>
          {tCommon("appName")}
        </Typography>
        <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
          {t("signInHeading")}
        </Typography>

        <LoginForm />
      </Box>
    </Box>
  );
}
