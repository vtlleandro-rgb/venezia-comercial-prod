import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não configurada.");
}

const migrationsDir = path.resolve("drizzle/migrations");

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b));

if (migrationFiles.length === 0) {
  throw new Error("Nenhuma migration .sql encontrada em drizzle/migrations.");
}

const connection = await mysql.createConnection(databaseUrl);

try {
  let totalStatements = 0;

  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, "utf8");

    const statements = sql
      .split(/;\s*(?:\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await connection.query(statement);
      totalStatements += 1;
    }

    console.log(`Migration aplicada: ${file} (${statements.length} comandos).`);
  }

  console.log(
    `Migrations OK: ${migrationFiles.length} arquivos, ${totalStatements} comandos executados.`
  );
} finally {
  await connection.end();
}
