export interface SuperAdminConfig {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const superAdminConfig: SuperAdminConfig = {
  username: process.env.SUPER_ADMIN_USERNAME ?? "",
  password: process.env.SUPER_ADMIN_PASSWORD ?? "",
  firstName: process.env.SUPER_ADMIN_FIRST_NAME ?? "",
  lastName: process.env.SUPER_ADMIN_LAST_NAME ?? "",
};
