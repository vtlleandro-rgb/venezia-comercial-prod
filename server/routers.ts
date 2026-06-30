import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, manageProcedure, router } from "./_core/trpc";
import {
  getCorretorBySlug,
  listCorretores,
  createCorretor,
  updateCorretor,
  deleteCorretor,
  listImobiliarias,
  createImobiliaria,
  updateImobiliaria,
  createLead,
  listLeads,
  listLeadsByCorretor,
  registrarAcesso,
  countAcessosByCorretor,
  countLeadsByCorretor,
  salvarProposta,
  getPropostaByCodigo,
  getUnidadesStatus,
  updateUnidadeStatus,
  registrarVenda,
  listVendas,
  registrarCancelamento,
  listCancelamentos,
} from "./db";

// ─── Corretores Router (público + admin) ────────────────────────────────────

const corretoresRouter = router({
  // Público: buscar corretor por slug (usado pelo frontend quando ?corretor=slug)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      return getCorretorBySlug(input.slug);
    }),

  // Admin ou Gerente: listar todos os corretores
  list: manageProcedure.query(async () => {
    return listCorretores();
  }),

  // Admin ou Gerente: criar corretor
  create: manageProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
        creci: z.string().optional(),
        fotoUrl: z.string().optional(),
        imobiliariaId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createCorretor({
        nome: input.nome,
        slug: input.slug,
        telefone: input.telefone ?? null,
        whatsapp: input.whatsapp ?? null,
        email: input.email ?? null,
        creci: input.creci ?? null,
        fotoUrl: input.fotoUrl ?? null,
        imobiliariaId: input.imobiliariaId ?? null,
        ativo: 1,
      });
    }),

  // Admin ou Gerente: atualizar corretor
  update: manageProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
        creci: z.string().optional(),
        fotoUrl: z.string().optional(),
        imobiliariaId: z.number().nullable().optional(),
        ativo: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCorretor(id, data);
      return { success: true };
    }),

  // Admin ou Gerente: desativar corretor
  delete: manageProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCorretor(input.id);
      return { success: true };
    }),

  // Protegido: corretor busca seus próprios dados pelo email do usuário logado
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const allCorretores = await listCorretores();
    return allCorretores.find((c) => c.email === ctx.user.email) ?? null;
  }),

  // Protegido: leads do próprio corretor (vinculado por email)
  meusLeads: protectedProcedure.query(async ({ ctx }) => {
    const allCorretores = await listCorretores();
    const meu = allCorretores.find((c) => c.email === ctx.user.email);
    if (!meu) return [];
    return listLeadsByCorretor(meu.id);
  }),

  // Protegido: corretor edita seus próprios dados (vinculado por email)
  updateMe: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
        creci: z.string().optional(),
        fotoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se o corretor pertence ao usuário logado (por email)
      const allCorretores = await listCorretores();
      const meuCorretor = allCorretores.find(
        (c) => c.email === ctx.user.email
      );
      if (!meuCorretor || meuCorretor.id !== input.id) {
        throw new Error("Você não tem permissão para editar este corretor.");
      }
      const { id, ...data } = input;
      await updateCorretor(id, data);
      return { success: true };
    }),
});

// ─── Imobiliárias Router (admin) ────────────────────────────────────────────

const imobiliariasRouter = router({
  list: manageProcedure.query(async () => {
    return listImobiliarias();
  }),

  create: manageProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        cnpj: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createImobiliaria({
        nome: input.nome,
        cnpj: input.cnpj ?? null,
        telefone: input.telefone ?? null,
        email: input.email ?? null,
        ativa: 1,
      });
    }),

  update: manageProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        cnpj: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
        ativa: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateImobiliaria(id, data);
      return { success: true };
    }),
});

// ─── Leads Router (público para captura + admin para consulta) ──────────────

const leadsRouter = router({
  // Público: registrar lead (formulário do site)
  registrar: publicProcedure
    .input(
      z.object({
        nomeCliente: z.string().min(1),
        telefoneCliente: z.string().optional(),
        emailCliente: z.string().email().optional(),
        corretorId: z.number().nullable().optional(),
        imobiliariaId: z.number().nullable().optional(),
        origem: z.string().optional(),
        mensagem: z.string().optional(),
        unidadeInteresse: z.string().optional(),
        simulacaoRealizada: z.number().optional(),
        propostaGerada: z.number().optional(),
        valorSimulado: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createLead({
        nomeCliente: input.nomeCliente,
        telefoneCliente: input.telefoneCliente ?? null,
        emailCliente: input.emailCliente ?? null,
        corretorId: input.corretorId ?? null,
        imobiliariaId: input.imobiliariaId ?? null,
        origem: input.origem ?? null,
        mensagem: input.mensagem ?? null,
        unidadeInteresse: input.unidadeInteresse ?? null,
        simulacaoRealizada: input.simulacaoRealizada ?? 0,
        propostaGerada: input.propostaGerada ?? 0,
        valorSimulado: input.valorSimulado ?? null,
      });
    }),

  // Admin ou Gerente: listar todos os leads
  list: manageProcedure.query(async () => {
    return listLeads();
  }),

  // Admin ou Gerente: listar leads por corretor
  byCorretor: manageProcedure
    .input(z.object({ corretorId: z.number() }))
    .query(async ({ input }) => {
      return listLeadsByCorretor(input.corretorId);
    }),
});

// ─── Acessos Router (público para registro + admin para analytics) ──────────

const acessosRouter = router({
  // Público: registrar acesso via link do corretor
  registrar: publicProcedure
    .input(
      z.object({
        corretorId: z.number(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0] || ctx.req.ip || null;
      await registrarAcesso({
        corretorId: input.corretorId,
        ip,
        userAgent: input.userAgent ?? null,
      });
      return { success: true };
    }),

  // Admin ou Gerente: analytics de acessos
  stats: manageProcedure.query(async () => {
    const acessosPorCorretor = await countAcessosByCorretor();
    const leadsPorCorretor = await countLeadsByCorretor();
    return { acessosPorCorretor, leadsPorCorretor };
  }),
});

// ─── Propostas Router (salvar e visualizar online) ──────────────────────────

const propostasRouter = router({
  salvar: publicProcedure
    .input(z.object({
      htmlContent: z.string().min(1),
      corretorId: z.number().optional(),
      nomeCliente: z.string().optional(),
      valorImovel: z.number().optional(),
      unidadeNumero: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const codigo = `VNZ-${Date.now().toString(36).toUpperCase()}`;
      await salvarProposta({
        codigo,
        htmlContent: input.htmlContent,
        corretorId: input.corretorId || null,
        nomeCliente: input.nomeCliente || null,
        valorImovel: input.valorImovel || null,
        unidadeNumero: input.unidadeNumero || null,
      });
      return { codigo };
    }),
  getByCodigo: publicProcedure
    .input(z.object({ codigo: z.string().min(1) }))
    .query(async ({ input }) => {
      return getPropostaByCodigo(input.codigo);
    }),
});

// ─── Unidades Router ────────────────────────────────────────────────────────

const unidadesRouter = router({
  // Público: status das unidades é visível a todos (tabela comercial pública)
  getStatus: publicProcedure.query(async () => {
    return getUnidadesStatus();
  }),

  // Admin ou Gerente: somente gestão pode alterar status de unidades
  updateStatus: manageProcedure
    .input(z.object({
      unidadeId: z.string().min(1).max(20),
      status: z.enum(["disponivel", "reservado", "vendido"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const updatedBy = ctx.user.name ?? ctx.user.email ?? "admin";
      await updateUnidadeStatus(input.unidadeId, input.status, updatedBy);
      return { success: true };
    }),
});

// ─── Vendas Router ──────────────────────────────────────────────────────────

const vendasRouter = router({
  // Admin ou Gerente: registrar dados de fechamento de venda
  registrar: manageProcedure
    .input(z.object({
      unidadeId: z.string().min(1).max(20),
      comprador: z.string().min(1).max(255),
      cpf: z.string().optional(),
      telefone: z.string().optional(),
      imobiliaria: z.string().optional(),
      corretor: z.string().optional(),
      dataAssinatura: z.string().optional(),
      valorSemDocumentacao: z.number().optional(),
      valorFinanciamento: z.number().optional(),
      fgts: z.number().optional(),
      entrada: z.number().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return registrarVenda(input);
    }),

  // Admin ou Gerente: listar vendas
  list: manageProcedure.query(async () => {
    return listVendas();
  }),
});

// ─── Cancelamentos Router ────────────────────────────────────────────────────

const cancelamentosRouter = router({
  // Admin ou Gerente: registrar cancelamento de reserva
  registrar: manageProcedure
    .input(z.object({
      unidadeId: z.string().min(1).max(20),
      unidadeNumero: z.string().optional(),
      motivo: z.string().min(1).max(255),
      observacoes: z.string().optional(),
      usuario: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return registrarCancelamento(input);
    }),

  // Admin ou Gerente: listar cancelamentos
  list: manageProcedure.query(async () => {
    return listCancelamentos();
  }),
});

// ─── App Router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  corretores: corretoresRouter,
  imobiliarias: imobiliariasRouter,
  leads: leadsRouter,
  acessos: acessosRouter,
  propostas: propostasRouter,
  unidades: unidadesRouter,
  vendas: vendasRouter,
  cancelamentos: cancelamentosRouter,
});

export type AppRouter = typeof appRouter;
