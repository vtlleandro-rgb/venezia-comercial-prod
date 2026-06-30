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
  passwordHash: varchar("password_hash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin", "gerente"]).default("user").notNull(),
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
 * Status oficial das unidades — fonte de verdade compartilhada entre usuários.
 * Substitui venezia_unidades_status do localStorage.
 */
export const unidadesStatus = mysqlTable("unidades_status", {
  id: int("id").autoincrement().primaryKey(),
  unidadeId: varchar("unidade_id", { length: 20 }).notNull().unique(),
  status: mysqlEnum("status", ["disponivel", "reservado", "vendido"]).notNull().default("disponivel"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  updatedBy: varchar("updated_by", { length: 255 }),
});

export type UnidadeStatusRow = typeof unidadesStatus.$inferSelect;
export type InsertUnidadeStatus = typeof unidadesStatus.$inferInsert;

/**
 * Dados de fechamento de venda por unidade.
 * Substitui venezia_dados_venda do localStorage.
 */
export const vendas = mysqlTable("vendas", {
  id: int("id").autoincrement().primaryKey(),
  unidadeId: varchar("unidade_id", { length: 20 }).notNull(),
  comprador: varchar("comprador", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 20 }),
  telefone: varchar("telefone", { length: 20 }),
  imobiliaria: varchar("imobiliaria", { length: 255 }),
  corretor: varchar("corretor", { length: 255 }),
  dataAssinatura: varchar("data_assinatura", { length: 20 }),
  valorSemDocumentacao: int("valor_sem_documentacao"),
  valorFinanciamento: int("valor_financiamento"),
  fgts: int("fgts"),
  entrada: int("entrada"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Venda = typeof vendas.$inferSelect;
export type InsertVenda = typeof vendas.$inferInsert;

/**
 * Histórico de cancelamentos de reserva.
 * Substitui venezia_cancelamentos do localStorage.
 */
export const cancelamentos = mysqlTable("cancelamentos", {
  id: int("id").autoincrement().primaryKey(),
  unidadeId: varchar("unidade_id", { length: 20 }).notNull(),
  unidadeNumero: varchar("unidade_numero", { length: 10 }),
  motivo: varchar("motivo", { length: 255 }).notNull(),
  observacoes: text("observacoes"),
  usuario: varchar("usuario", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Cancelamento = typeof cancelamentos.$inferSelect;
export type InsertCancelamento = typeof cancelamentos.$inferInsert;
