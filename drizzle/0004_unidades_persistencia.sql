CREATE TABLE `unidades_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unidade_id` varchar(20) NOT NULL,
	`status` enum('disponivel','reservado','vendido') NOT NULL DEFAULT 'disponivel',
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_by` varchar(255),
	CONSTRAINT `unidades_status_id` PRIMARY KEY(`id`),
	CONSTRAINT `unidades_status_unidade_id_unique` UNIQUE(`unidade_id`)
);
--> statement-breakpoint
CREATE TABLE `vendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unidade_id` varchar(20) NOT NULL,
	`comprador` varchar(255) NOT NULL,
	`cpf` varchar(20),
	`telefone` varchar(20),
	`imobiliaria` varchar(255),
	`corretor` varchar(255),
	`data_assinatura` varchar(20),
	`valor_sem_documentacao` int,
	`valor_financiamento` int,
	`fgts` int,
	`entrada` int,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `vendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cancelamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unidade_id` varchar(20) NOT NULL,
	`unidade_numero` varchar(10),
	`motivo` varchar(255) NOT NULL,
	`observacoes` text,
	`usuario` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `cancelamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `unidades_status` (`unidade_id`, `status`) VALUES
('101', 'disponivel'),
('102', 'disponivel'),
('103', 'disponivel'),
('201', 'disponivel'),
('202', 'disponivel'),
('203', 'disponivel'),
('301', 'disponivel'),
('302', 'disponivel'),
('303', 'disponivel'),
('401', 'disponivel'),
('402', 'disponivel'),
('403', 'disponivel');
