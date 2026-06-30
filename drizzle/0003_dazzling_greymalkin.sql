CREATE TABLE `propostas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(20) NOT NULL,
	`htmlContent` text NOT NULL,
	`corretorId` int,
	`nomeCliente` varchar(255),
	`valorImovel` int,
	`unidadeNumero` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propostas_id` PRIMARY KEY(`id`),
	CONSTRAINT `propostas_codigo_unique` UNIQUE(`codigo`)
);
