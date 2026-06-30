import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
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
} from "./db";

// ─── Corretores Router (público + admin) ────────────────────────────────────

const corretoresRouter = router({
  // Público: buscar corretor por slug (usado pelo frontend quando ?corretor=slug)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      return getCorretorBySlug(input.slug);
    }),

  // Protegido: listar todos os corretores
  list: protectedProcedure.query(async () => {
    return listCorretores();
  }),

  // Protegido: criar corretor
  create: protectedProcedure
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

  // Protegido: atualizar corretor
  update: protectedProcedure
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

  // Protegido: desativar corretor
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCorretor(input.id);
      return { success: true };
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
  list: protectedProcedure.query(async () => {
    return listImobiliarias();
  }),

  create: protectedProcedure
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

  update: protectedProcedure
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

  // Protegido: listar todos os leads
  list: protectedProcedure.query(async () => {
    return listLeads();
  }),

  // Protegido: listar leads por corretor
  byCorretor: protectedProcedure
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

  // Protegido: analytics de acessos
  stats: protectedProcedure.query(async () => {
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
});

export type AppRouter = typeof appRouter;
