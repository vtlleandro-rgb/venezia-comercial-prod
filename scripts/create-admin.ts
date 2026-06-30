/**
 * Script de criação do usuário admin inicial.
 *
 * Uso:
 *   ADMIN_EMAIL=seu@email.com ADMIN_PASSWORD=SenhaSegura123 npx tsx scripts/create-admin.ts
 *
 * Nunca commitar ADMIN_PASSWORD. Definir apenas na linha de comando ou via variável de ambiente temporária.
 * Executar APÓS aplicar a migration 0005 no banco Railway.
 */
import "dotenv/config";
import { randomUUID } from "crypto";
import { hashPassword } from "../server/_core/sdk";
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌  Defina ADMIN_EMAIL e ADMIN_PASSWORD antes de rodar este script.");
    console.error("    Exemplo:");
    console.error("    ADMIN_EMAIL=vtlleandro@gmail.com ADMIN_PASSWORD='SenhaSegura123!' npx tsx scripts/create-admin.ts");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌  Senha deve ter ao menos 8 caracteres.");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("❌  DATABASE_URL não configurado ou banco indisponível.");
    process.exit(1);
  }

  // Verificar se e-mail já existe
  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    const u = existing[0];
    if (u.passwordHash) {
      console.log(`⚠️  Usuário ${email} já existe com senha definida. Use a rota /api/auth/change-password para trocar.`);
      process.exit(0);
    }
    // Existe mas sem senha — apenas definir hash e role
    const passwordHash = await hashPassword(password);
    await db.update(users).set({ passwordHash, role: "admin", loginMethod: "email" }).where(eq(users.id, u.id));
    console.log(`✅  Senha e role admin definidos para usuário existente: ${email}`);
    process.exit(0);
  }

  // Criar novo usuário admin
  const passwordHash = await hashPassword(password);
  const openId = `local:${randomUUID()}`;

  await db.insert(users).values({
    openId,
    email: email.toLowerCase(),
    name: email.split("@")[0],
    loginMethod: "email",
    passwordHash,
    role: "admin",
    lastSignedIn: new Date(),
  });

  console.log(`✅  Admin criado com sucesso!`);
  console.log(`    E-mail: ${email}`);
  console.log(`    OpenId: ${openId}`);
  console.log(`    Role:   admin`);
  console.log(`\n⚠️  Troque a senha no primeiro login via: POST /api/auth/change-password`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Erro inesperado:", err);
  process.exit(1);
});
