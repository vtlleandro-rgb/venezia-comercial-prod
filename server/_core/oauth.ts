import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk, hashPassword, verifyPassword } from "./sdk";

export function registerOAuthRoutes(app: Express) {
  // ── POST /api/auth/login ─────────────────────────────────────────────────
  // Autenticação por e-mail + senha. Emite cookie de sessão JWT.
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      return;
    }

    const user = await db.getUserByEmail(email.trim().toLowerCase());

    if (!user || !user.passwordHash) {
      // Tempo constante para evitar enumeração de e-mails
      await new Promise((r) => setTimeout(r, 200));
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }

    const sessionToken = await sdk.createSessionToken(user.openId, {
      name: user.name ?? "",
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

    res.json({ ok: true, name: user.name, role: user.role });
  });

  // ── POST /api/auth/change-password ───────────────────────────────────────
  // Troca de senha. Requer sessão válida + senha atual correta.
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    const cookieHeader = req.headers.cookie ?? "";
    const cookieMap = new Map(
      cookieHeader.split(";").map((c) => c.trim().split("=") as [string, string]).filter(([k]) => k)
    );
    const session = await sdk.verifySession(cookieMap.get(COOKIE_NAME));
    if (!session) {
      res.status(401).json({ error: "Sessão inválida." });
      return;
    }

    const { currentPassword, newPassword } = req.body ?? {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      res.status(400).json({ error: "Campos obrigatórios ausentes." });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "Nova senha deve ter ao menos 8 caracteres." });
      return;
    }

    const user = await db.getUserByOpenId(session.openId);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Usuário não encontrado." });
      return;
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Senha atual incorreta." });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await db.setPasswordHash(user.id, newHash);
    res.json({ ok: true });
  });

  // ── GET /api/auth/setup-status ───────────────────────────────────────────
  // Retorna se já existe algum admin. Usado pelo script de setup.
  app.get("/api/auth/setup-status", async (_req: Request, res: Response) => {
    const count = await db.countAdmins();
    res.json({ hasAdmin: count > 0 });
  });
}
