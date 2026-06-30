/**
 * Força a role 'admin' para um usuário existente pelo e-mail.
 * Usar quando create-admin.ts saiu sem atualizar (passwordHash já existia).
 *
 * Uso:
 *   ADMIN_EMAIL=seu@email.com npx tsx scripts/set-admin-role.ts
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("❌  Defina ADMIN_EMAIL antes de rodar este script.");
    console.error("    Exemplo: ADMIN_EMAIL=vtlleandro@gmail.com npx tsx scripts/set-admin-role.ts");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("❌  DATABASE_URL não configurado ou banco indisponível.");
    process.exit(1);
  }

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length === 0) {
    console.error(`❌  Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  await db.update(users)
    .set({ role: "admin", loginMethod: "email" })
    .where(eq(users.email, email.toLowerCase()));

  console.log(`✅  Role 'admin' definida para: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Erro:", err);
  process.exit(1);
});
