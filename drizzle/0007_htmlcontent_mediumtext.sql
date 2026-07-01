-- Migration 0007: ampliar htmlContent de TEXT para MEDIUMTEXT
-- TEXT MySQL = 65.535 bytes; HTML com logos base64 excede esse limite.
-- MEDIUMTEXT = 16.777.215 bytes (16 MB) — suficiente para qualquer proposta.
ALTER TABLE `propostas` MODIFY COLUMN `htmlContent` MEDIUMTEXT NOT NULL;
