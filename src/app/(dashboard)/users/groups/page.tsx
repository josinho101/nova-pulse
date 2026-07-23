import Typography from "@mui/material/Typography";
import { getTranslations } from "next-intl/server";

export default async function GroupsPage() {
  const t = await getTranslations("Sidebar");
  const tComingSoon = await getTranslations("ComingSoonPage");

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        {t("groups")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {tComingSoon("message")}
      </Typography>
    </>
  );
}
