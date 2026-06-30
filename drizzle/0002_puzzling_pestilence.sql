ALTER TABLE `leads` ADD `unidadeInteresse` varchar(50);--> statement-breakpoint
ALTER TABLE `leads` ADD `simulacaoRealizada` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `leads` ADD `propostaGerada` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `leads` ADD `valorSimulado` int;