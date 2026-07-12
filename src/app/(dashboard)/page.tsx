import Typography from "@mui/material/Typography";
import { getTranslations } from "next-intl/server";

export default async function DashboardHomePage() {
  const t = await getTranslations("DashboardPage");
  const tCommon = await getTranslations("Common");

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        {tCommon("appName")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("welcomeMessage")}
      </Typography>
    </>
  );
}
