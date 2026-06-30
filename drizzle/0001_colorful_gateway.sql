CREATE TABLE `acessos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`corretorId` int,
	`ip` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `acessos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `corretores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`telefone` varchar(20),
	`whatsapp` varchar(20),
	`email` varchar(320),
	`creci` varchar(30),
	`fotoUrl` text,
	`imobiliariaId` int,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `corretores_id` PRIMARY KEY(`id`),
	CONSTRAINT `corretores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `imobiliarias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`telefone` varchar(20),
	`email` varchar(320),
	`ativa` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imobiliarias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeCliente` varchar(255) NOT NULL,
	`telefoneCliente` varchar(20),
	`emailCliente` varchar(320),
	`corretorId` int,
	`imobiliariaId` int,
	`origem` varchar(100),
	`mensagem` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
