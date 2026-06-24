import { z } from "zod";
import { SignJWT } from "jose";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
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
  listUnidadesStatus,
  salvarUnidadeStatus,
  listVendasUnidades,
  salvarVendaUnidade,
  listLogsComerciais,
  salvarLogComercial,
  listCancelamentosReservas,
  salvarCancelamentoReserva,
  listPropostasComerciais,
  salvarPropostaComercial,
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
  create: adminProcedure
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
  update: adminProcedure
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
  delete: adminProcedure
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

  create: adminProcedure
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

  update: adminProcedure
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
  list: adminProcedure.query(async () => {
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
  stats: adminProcedure.query(async () => {
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



// ─── Comercial Router (estado persistente das unidades) ────────────────────

const comercialRouter = router({
  statusPublic: publicProcedure.query(async () => {
    return listUnidadesStatus();
  }),

  snapshot: adminProcedure.query(async () => {
    const [status, vendas, logs, cancelamentos, propostasComerciais] = await Promise.all([
      listUnidadesStatus(),
      listVendasUnidades(),
      listLogsComerciais(),
      listCancelamentosReservas(),
      listPropostasComerciais(),
    ]);

    return { status, vendas, logs, cancelamentos, propostasComerciais };
  }),

  updateStatus: adminProcedure
    .input(z.object({ unidadeId: z.string().min(1), status: z.enum(["disponivel", "reservado", "vendido"]) }))
    .mutation(async ({ input }) => {
      return salvarUnidadeStatus(input);
    }),

  salvarVenda: adminProcedure
    .input(z.object({
      unidadeId: z.string().min(1),
      comprador: z.string().min(1),
      cpf: z.string().optional(),
      telefone: z.string().optional(),
      imobiliaria: z.string().min(1),
      corretor: z.string().min(1),
      dataAssinatura: z.string().min(1),
      valorSemDocumentacao: z.number(),
      valorFinanciamento: z.number(),
      fgts: z.number(),
      entrada: z.number(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return salvarVendaUnidade({
        ...input,
        cpf: input.cpf ?? null,
        telefone: input.telefone ?? null,
        observacoes: input.observacoes ?? null,
      });
    }),

  addLog: adminProcedure
    .input(z.object({
      unidade: z.string().min(1),
      statusAnterior: z.string().min(1),
      statusNovo: z.string().min(1),
      usuario: z.string().min(1),
      detalhes: z.string().optional(),
      tipo: z.enum(["reserva", "cancelamento", "venda", "distrato", "alteracao"]).optional(),
      motivo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return salvarLogComercial({
        ...input,
        id: crypto.randomUUID(),
        detalhes: input.detalhes ?? null,
        tipo: input.tipo ?? null,
        motivo: input.motivo ?? null,
        data: new Date(),
      });
    }),

  addCancelamento: adminProcedure
    .input(z.object({
      unidadeId: z.string().min(1),
      unidadeNumero: z.string().min(1),
      motivo: z.string().min(1),
      observacoes: z.string().optional(),
      usuario: z.string().min(1),
      dadosReservaAnterior: z.unknown().optional(),
    }))
    .mutation(async ({ input }) => {
      return salvarCancelamentoReserva({
        id: crypto.randomUUID(),
        unidadeId: input.unidadeId,
        unidadeNumero: input.unidadeNumero,
        motivo: input.motivo,
        observacoes: input.observacoes ?? null,
        usuario: input.usuario,
        dadosReservaAnterior: input.dadosReservaAnterior ? JSON.stringify(input.dadosReservaAnterior) : null,
        data: new Date(),
      });
    }),

  addPropostaComercial: adminProcedure
    .input(z.object({
      unidadeId: z.string().min(1),
      unidadeNumero: z.string().min(1),
      comprador: z.string().min(1),
      cpf: z.string().optional(),
      telefone: z.string().optional(),
      imobiliaria: z.string().min(1),
      corretor: z.string().min(1),
      valorBase: z.number(),
      tipoValor: z.string().min(1),
      entrada: z.number(),
      financiamento: z.number(),
      fgts: z.number(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return salvarPropostaComercial({
        ...input,
        id: crypto.randomUUID(),
        cpf: input.cpf ?? null,
        telefone: input.telefone ?? null,
        observacoes: input.observacoes ?? null,
        dataGeracao: new Date(),
      });
    }),
});

// ─── App Router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const configuredPassword = ENV.adminPassword || "venezia2025";
        if (input.password !== configuredPassword) {
          throw new Error("Senha inválida.");
        }

        if (!ENV.cookieSecret) {
          throw new Error("JWT_SECRET is required for admin authentication.");
        }

        const token = await new SignJWT({
          role: "admin",
          email: "admin@venezia.local",
        })
          .setProtectedHeader({ alg: "HS256" })
          .setSubject("local-admin")
          .setIssuedAt()
          .setExpirationTime("8h")
          .sign(new TextEncoder().encode(ENV.cookieSecret));

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 8 });
        return { success: true } as const;
      }),
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
  comercial: comercialRouter,
});

export type AppRouter = typeof appRouter;
