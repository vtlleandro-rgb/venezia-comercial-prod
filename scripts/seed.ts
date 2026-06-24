import "dotenv/config";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const connection = await mysql.createConnection(databaseUrl);

try {
  await connection.execute(
    `INSERT INTO users (openId, name, email, loginMethod, role)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), role = VALUES(role)`,
    ["local-admin", "Administrador Venezia", "admin@venezia.local", "password", "admin"],
  );

  const [imobiliarias] = await connection.execute<RowDataPacket[]>(
    "SELECT id FROM imobiliarias WHERE nome = ? LIMIT 1",
    ["Blue Real Estate"],
  );

  let imobiliariaId = Number(imobiliarias[0]?.id);
  if (!imobiliariaId) {
    const [imobiliariaResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO imobiliarias (nome, cnpj, telefone, email, ativa)
       VALUES (?, ?, ?, ?, ?)`,
      ["Blue Real Estate", null, null, "contato@bluerealestate.com.br", 1],
    );
    imobiliariaId = imobiliariaResult.insertId;
  }

  await connection.execute(
    `INSERT INTO corretores (nome, slug, telefone, whatsapp, email, creci, fotoUrl, imobiliariaId, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), imobiliariaId = VALUES(imobiliariaId), ativo = VALUES(ativo)`,
    ["Corretor Padrao", "corretor-padrao", null, null, "corretor@venezia.local", null, null, imobiliariaId, 1],
  );

  console.log("Seed Venezia Comercial executado com sucesso.");
} finally {
  await connection.end();
}
