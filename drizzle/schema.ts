import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Imobiliárias parceiras
 */
export const imobiliarias = mysqlTable("imobiliarias", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  ativa: int("ativa").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Imobiliaria = typeof imobiliarias.$inferSelect;
export type InsertImobiliaria = typeof imobiliarias.$inferInsert;

/**
 * Corretores vinculados a imobiliárias
 */
export const corretores = mysqlTable("corretores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  creci: varchar("creci", { length: 30 }),
  fotoUrl: text("fotoUrl"),
  imobiliariaId: int("imobiliariaId"),
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Corretor = typeof corretores.$inferSelect;
export type InsertCorretor = typeof corretores.$inferInsert;

/**
 * Leads capturados via formulários do site
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  nomeCliente: varchar("nomeCliente", { length: 255 }).notNull(),
  telefoneCliente: varchar("telefoneCliente", { length: 20 }),
  emailCliente: varchar("emailCliente", { length: 320 }),
  corretorId: int("corretorId"),
  imobiliariaId: int("imobiliariaId"),
  origem: varchar("origem", { length: 100 }),
  mensagem: text("mensagem"),
  unidadeInteresse: varchar("unidadeInteresse", { length: 50 }),
  simulacaoRealizada: int("simulacaoRealizada").default(0),
  propostaGerada: int("propostaGerada").default(0),
  valorSimulado: int("valorSimulado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Registro de acessos por corretor (analytics)
 */
export const acessos = mysqlTable("acessos", {
  id: int("id").autoincrement().primaryKey(),
  corretorId: int("corretorId"),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Acesso = typeof acessos.$inferSelect;
export type InsertAcesso = typeof acessos.$inferInsert;

/**
 * Propostas comerciais salvas (para link de visualização online)
 */
export const propostas = mysqlTable("propostas", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),
  htmlContent: text("htmlContent").notNull(),
  corretorId: int("corretorId"),
  nomeCliente: varchar("nomeCliente", { length: 255 }),
  valorImovel: int("valorImovel"),
  unidadeNumero: varchar("unidadeNumero", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Proposta = typeof propostas.$inferSelect;
export type InsertProposta = typeof propostas.$inferInsert;


/**
 * Status operacional das unidades no funil comercial.
 */
export const unidadesStatus = mysqlTable("unidades_status", {
  unidadeId: varchar("unidadeId", { length: 50 }).primaryKey(),
  status: mysqlEnum("status", ["disponivel", "reservado", "vendido"]).default("disponivel").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UnidadeStatusRecord = typeof unidadesStatus.$inferSelect;
export type InsertUnidadeStatus = typeof unidadesStatus.$inferInsert;

/**
 * Dados de reserva/venda por unidade.
 */
export const vendasUnidades = mysqlTable("vendas_unidades", {
  unidadeId: varchar("unidadeId", { length: 50 }).primaryKey(),
  comprador: varchar("comprador", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 30 }),
  telefone: varchar("telefone", { length: 30 }),
  imobiliaria: varchar("imobiliaria", { length: 255 }).notNull(),
  corretor: varchar("corretor", { length: 255 }).notNull(),
  dataAssinatura: varchar("dataAssinatura", { length: 30 }).notNull(),
  valorSemDocumentacao: int("valorSemDocumentacao").notNull(),
  valorFinanciamento: int("valorFinanciamento").notNull(),
  fgts: int("fgts").notNull(),
  entrada: int("entrada").notNull(),
  observacoes: text("observacoes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VendaUnidade = typeof vendasUnidades.$inferSelect;
export type InsertVendaUnidade = typeof vendasUnidades.$inferInsert;

/**
 * Histórico comercial auditável.
 */
export const logsComerciais = mysqlTable("logs_comerciais", {
  id: varchar("id", { length: 64 }).primaryKey(),
  unidade: varchar("unidade", { length: 50 }).notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }).notNull(),
  statusNovo: varchar("statusNovo", { length: 50 }).notNull(),
  usuario: varchar("usuario", { length: 255 }).notNull(),
  detalhes: text("detalhes"),
  tipo: varchar("tipo", { length: 30 }),
  motivo: text("motivo"),
  data: timestamp("data").defaultNow().notNull(),
});

export type LogComercial = typeof logsComerciais.$inferSelect;
export type InsertLogComercial = typeof logsComerciais.$inferInsert;

/**
 * Cancelamentos de reserva/venda.
 */
export const cancelamentosReservas = mysqlTable("cancelamentos_reservas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  unidadeId: varchar("unidadeId", { length: 50 }).notNull(),
  unidadeNumero: varchar("unidadeNumero", { length: 50 }).notNull(),
  motivo: text("motivo").notNull(),
  observacoes: text("observacoes"),
  usuario: varchar("usuario", { length: 255 }).notNull(),
  dadosReservaAnterior: text("dadosReservaAnterior"),
  data: timestamp("data").defaultNow().notNull(),
});

export type CancelamentoReservaRecord = typeof cancelamentosReservas.$inferSelect;
export type InsertCancelamentoReserva = typeof cancelamentosReservas.$inferInsert;

/**
 * Propostas comerciais geradas no painel interno.
 */
export const propostasComerciais = mysqlTable("propostas_comerciais", {
  id: varchar("id", { length: 64 }).primaryKey(),
  unidadeId: varchar("unidadeId", { length: 50 }).notNull(),
  unidadeNumero: varchar("unidadeNumero", { length: 50 }).notNull(),
  comprador: varchar("comprador", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 30 }),
  telefone: varchar("telefone", { length: 30 }),
  imobiliaria: varchar("imobiliaria", { length: 255 }).notNull(),
  corretor: varchar("corretor", { length: 255 }).notNull(),
  valorBase: int("valorBase").notNull(),
  tipoValor: varchar("tipoValor", { length: 80 }).notNull(),
  entrada: int("entrada").notNull(),
  financiamento: int("financiamento").notNull(),
  fgts: int("fgts").notNull(),
  observacoes: text("observacoes"),
  dataGeracao: timestamp("dataGeracao").defaultNow().notNull(),
});

export type PropostaComercialRecord = typeof propostasComerciais.$inferSelect;
export type InsertPropostaComercial = typeof propostasComerciais.$inferInsert;
