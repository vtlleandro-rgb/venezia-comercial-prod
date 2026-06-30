import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Bypass de autenticação exclusivo para homologação local.
// Ativo SOMENTE quando NODE_ENV=development E LOCAL_AUTH_BYPASS=true.
// Nunca ativo em produção — duas condições obrigatórias simultâneas.
const LOCAL_BYPASS_ACTIVE =
  process.env.NODE_ENV !== "production" &&
  process.env.LOCAL_AUTH_BYPASS === "true";

const LOCAL_BYPASS_USER: User = {
  id: 0,
  openId: "local-dev-bypass",
  name: "Dev Admin (Homologação)",
  email: "dev@venezia.local",
  loginMethod: "bypass",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  if (LOCAL_BYPASS_ACTIVE) {
    return { req: opts.req, res: opts.res, user: LOCAL_BYPASS_USER };
  }

  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
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
