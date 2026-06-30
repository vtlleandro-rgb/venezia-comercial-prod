import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  corretores,
  imobiliarias,
  leads,
  acessos,
  propostas,
  InsertCorretor,
  InsertImobiliaria,
  InsertLead,
  InsertAcesso,
  InsertProposta,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Imobiliárias ───────────────────────────────────────────────────────────

export async function listImobiliarias() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(imobiliarias).orderBy(imobiliarias.nome);
}

export async function createImobiliaria(data: Omit<InsertImobiliaria, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(imobiliarias).values(data);
  return { id: result[0].insertId };
}

export async function updateImobiliaria(id: number, data: Partial<Omit<InsertImobiliaria, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(imobiliarias).set(data).where(eq(imobiliarias.id, id));
}

// ─── Corretores ─────────────────────────────────────────────────────────────

export async function getCorretorBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(corretores)
    .where(eq(corretores.slug, slug))
    .limit(1);
  if (result.length === 0) return null;

  // Also fetch imobiliária name if linked
  const corretor = result[0];
  if (corretor.imobiliariaId) {
    const imob = await db
      .select()
      .from(imobiliarias)
      .where(eq(imobiliarias.id, corretor.imobiliariaId))
      .limit(1);
    return { ...corretor, imobiliariaNome: imob[0]?.nome ?? null };
  }
  return { ...corretor, imobiliariaNome: null };
}

export async function listCorretores() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(corretores).orderBy(corretores.nome);
  // Enrich with imobiliária name
  const imobs = await db.select().from(imobiliarias);
  const imobMap = new Map(imobs.map((i) => [i.id, i.nome]));
  return result.map((c) => ({
    ...c,
    imobiliariaNome: c.imobiliariaId ? imobMap.get(c.imobiliariaId) ?? null : null,
  }));
}

export async function createCorretor(data: Omit<InsertCorretor, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(corretores).values(data);
  return { id: result[0].insertId };
}

export async function updateCorretor(id: number, data: Partial<Omit<InsertCorretor, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(corretores).set(data).where(eq(corretores.id, id));
}

export async function deleteCorretor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(corretores).set({ ativo: 0 }).where(eq(corretores.id, id));
}

// ─── Leads ──────────────────────────────────────────────────────────────────

export async function createLead(data: Omit<InsertLead, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(data);
  return { id: result[0].insertId };
}

export async function listLeads(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}

export async function listLeadsByCorretor(corretorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(leads)
    .where(eq(leads.corretorId, corretorId))
    .orderBy(desc(leads.createdAt));
}

// ─── Acessos ────────────────────────────────────────────────────────────────

export async function registrarAcesso(data: Omit<InsertAcesso, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) return;
  await db.insert(acessos).values(data);
}

export async function countAcessosByCorretor() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      corretorId: acessos.corretorId,
      total: sql<number>`count(*)`.as("total"),
    })
    .from(acessos)
    .groupBy(acessos.corretorId);
  return result;
}

export async function countLeadsByCorretor() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      corretorId: leads.corretorId,
      total: sql<number>`count(*)`.as("total"),
    })
    .from(leads)
    .groupBy(leads.corretorId);
  return result;
}

// ─── Propostas ───────────────────────────────────────────────────────────────

export async function salvarProposta(data: InsertProposta) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(propostas).values(data);
  return data.codigo;
}

export async function getPropostaByCodigo(codigo: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(propostas).where(eq(propostas.codigo, codigo)).limit(1);
  return result[0] || null;
}
