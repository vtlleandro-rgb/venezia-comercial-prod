export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? process.env.VITE_ADMIN_PASSWORD ?? "",
  frontendUrl: process.env.FRONTEND_URL?.replace(/\/$/, "") ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
