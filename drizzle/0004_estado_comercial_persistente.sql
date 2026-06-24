CREATE TABLE `unidades_status` (
  `unidadeId` varchar(50) NOT NULL,
  `status` enum('disponivel','reservado','vendido') NOT NULL DEFAULT 'disponivel',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`unidadeId`)
);

CREATE TABLE `vendas_unidades` (
  `unidadeId` varchar(50) NOT NULL,
  `comprador` varchar(255) NOT NULL,
  `cpf` varchar(30),
  `telefone` varchar(30),
  `imobiliaria` varchar(255) NOT NULL,
  `corretor` varchar(255) NOT NULL,
  `dataAssinatura` varchar(30) NOT NULL,
  `valorSemDocumentacao` int NOT NULL,
  `valorFinanciamento` int NOT NULL,
  `fgts` int NOT NULL,
  `entrada` int NOT NULL,
  `observacoes` text,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`unidadeId`)
);

CREATE TABLE `logs_comerciais` (
  `id` varchar(64) NOT NULL,
  `unidade` varchar(50) NOT NULL,
  `statusAnterior` varchar(50) NOT NULL,
  `statusNovo` varchar(50) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `detalhes` text,
  `tipo` varchar(30),
  `motivo` text,
  `data` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `cancelamentos_reservas` (
  `id` varchar(64) NOT NULL,
  `unidadeId` varchar(50) NOT NULL,
  `unidadeNumero` varchar(50) NOT NULL,
  `motivo` text NOT NULL,
  `observacoes` text,
  `usuario` varchar(255) NOT NULL,
  `dadosReservaAnterior` text,
  `data` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `propostas_comerciais` (
  `id` varchar(64) NOT NULL,
  `unidadeId` varchar(50) NOT NULL,
  `unidadeNumero` varchar(50) NOT NULL,
  `comprador` varchar(255) NOT NULL,
  `cpf` varchar(30),
  `telefone` varchar(30),
  `imobiliaria` varchar(255) NOT NULL,
  `corretor` varchar(255) NOT NULL,
  `valorBase` int NOT NULL,
  `tipoValor` varchar(80) NOT NULL,
  `entrada` int NOT NULL,
  `financiamento` int NOT NULL,
  `fgts` int NOT NULL,
  `observacoes` text,
  `dataGeracao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
