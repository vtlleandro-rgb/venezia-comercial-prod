import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function getCookieValue(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader) return undefined;
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
}

function getJwtSecret() {
  if (!ENV.cookieSecret) {
    throw new Error("JWT_SECRET is required for admin authentication.");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

function createAdminUser(email = "admin@venezia.local"): User {
  const now = new Date();
  return {
    id: 1,
    openId: "local-admin",
    name: "Administrador Venezia",
    email,
    loginMethod: "password",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token = getCookieValue(opts.req.headers.cookie, COOKIE_NAME);
    if (token) {
      const { payload } = await jwtVerify(token, getJwtSecret());
      if (payload.role === "admin") {
        user = createAdminUser(typeof payload.email === "string" ? payload.email : undefined);
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
