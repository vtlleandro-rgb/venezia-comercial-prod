CREATE TABLE IF NOT EXISTS operacao_logs (
  id int AUTO_INCREMENT PRIMARY KEY,
  unidade varchar(50) NOT NULL,
  statusAnterior varchar(50) NOT NULL,
  statusNovo varchar(50) NOT NULL,
  usuario varchar(120),
  detalhes text,
  tipo varchar(40),
  motivo text,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendas (
  id int AUTO_INCREMENT PRIMARY KEY,
  unidadeId varchar(50) NOT NULL,
  comprador varchar(255) NOT NULL,
  cpf varchar(20),
  telefone varchar(30),
  imobiliaria varchar(255) NOT NULL,
  corretor varchar(255) NOT NULL,
  dataAssinatura varchar(20) NOT NULL,
  valorSemDocumentacao int NOT NULL,
  valorFinanciamento int NOT NULL,
  fgts int NOT NULL DEFAULT 0,
  entrada int NOT NULL,
  observacoes text,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY vendas_unidade_id_idx (unidadeId)
);

CREATE TABLE IF NOT EXISTS cancelamentos_reservas (
  id int AUTO_INCREMENT PRIMARY KEY,
  unidadeId varchar(50) NOT NULL,
  unidadeNumero varchar(50) NOT NULL,
  motivo text NOT NULL,
  observacoes text,
  usuario varchar(120) NOT NULL,
  dadosReservaAnterior text,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposta_registros (
  id int AUTO_INCREMENT PRIMARY KEY,
  unidadeId varchar(50) NOT NULL,
  unidadeNumero varchar(50) NOT NULL,
  comprador varchar(255) NOT NULL,
  cpf varchar(20),
  telefone varchar(30),
  imobiliaria varchar(255) NOT NULL,
  corretor varchar(255) NOT NULL,
  valorBase int NOT NULL,
  tipoValor varchar(80) NOT NULL,
  entrada int NOT NULL,
  financiamento int NOT NULL,
  fgts int NOT NULL DEFAULT 0,
  observacoes text,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
