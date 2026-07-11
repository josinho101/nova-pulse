export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSuperAdmin } = await import("@/server/bootstrap/super-admin");
    await ensureSuperAdmin();
  }
}
