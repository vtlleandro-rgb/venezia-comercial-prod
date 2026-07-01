import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL não configurado");

  console.log("Aplicando migration 0007: htmlContent TEXT → MEDIUMTEXT...");
  await db.execute(sql`ALTER TABLE \`propostas\` MODIFY COLUMN \`htmlContent\` MEDIUMTEXT NOT NULL`);
  console.log("Migration 0007 aplicada com sucesso.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
