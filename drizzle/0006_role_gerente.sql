-- Migration 0006: adiciona role "gerente" ao enum da tabela users
-- Permite que usuários com role gerente cadastrem corretores e alterem
-- status de unidades, sem acesso a funções exclusivas de admin.
-- ALTER ENUM validado no MySQL 9.4 (Railway) antes de aplicar.
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','gerente') NOT NULL DEFAULT 'user';
