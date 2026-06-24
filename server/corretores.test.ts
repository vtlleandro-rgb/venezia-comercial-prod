import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getCorretorBySlug: vi.fn(),
  listCorretores: vi.fn(),
  createCorretor: vi.fn(),
  updateCorretor: vi.fn(),
  deleteCorretor: vi.fn(),
  listImobiliarias: vi.fn(),
  createImobiliaria: vi.fn(),
  updateImobiliaria: vi.fn(),
  createLead: vi.fn(),
  listLeads: vi.fn(),
  listLeadsByCorretor: vi.fn(),
  registrarAcesso: vi.fn(),
  countAcessosByCorretor: vi.fn(),
  countLeadsByCorretor: vi.fn(),
}));

import {
  getCorretorBySlug,
  listCorretores,
  createCorretor,
  createLead,
  listLeads,
  registrarAcesso,
  countAcessosByCorretor,
  countLeadsByCorretor,
} from "./db";

describe("Corretores DB helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCorretorBySlug returns corretor data when found", async () => {
    const mockCorretor = {
      id: 1,
      nome: "Leandro Santos",
      slug: "leandro-santos",
      telefone: "(48) 99999-0000",
      whatsapp: "5548999990000",
      email: "leandro@test.com",
      creci: "12345-F",
      fotoUrl: null,
      imobiliariaId: 1,
      ativo: 1,
      imobiliariaNome: "Imob Test",
    };

    (getCorretorBySlug as any).mockResolvedValue(mockCorretor);

    const result = await getCorretorBySlug("leandro-santos");
    expect(result).toEqual(mockCorretor);
    expect(result?.slug).toBe("leandro-santos");
    expect(result?.whatsapp).toBe("5548999990000");
  });

  it("getCorretorBySlug returns null when not found", async () => {
    (getCorretorBySlug as any).mockResolvedValue(null);

    const result = await getCorretorBySlug("nao-existe");
    expect(result).toBeNull();
  });

  it("listCorretores returns array of corretores", async () => {
    const mockList = [
      { id: 1, nome: "Corretor A", slug: "corretor-a", ativo: 1 },
      { id: 2, nome: "Corretor B", slug: "corretor-b", ativo: 1 },
    ];

    (listCorretores as any).mockResolvedValue(mockList);

    const result = await listCorretores();
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("corretor-a");
  });

  it("createCorretor returns new id", async () => {
    (createCorretor as any).mockResolvedValue({ id: 3 });

    const result = await createCorretor({
      nome: "Novo Corretor",
      slug: "novo-corretor",
      telefone: null,
      whatsapp: "5548999990001",
      email: null,
      creci: null,
      fotoUrl: null,
      imobiliariaId: null,
      ativo: 1,
    });

    expect(result.id).toBe(3);
  });
});

describe("Leads DB helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createLead registers a new lead", async () => {
    (createLead as any).mockResolvedValue({ id: 1 });

    const result = await createLead({
      nomeCliente: "Maria Silva",
      telefoneCliente: "(48) 99999-1111",
      emailCliente: "maria@test.com",
      corretorId: 1,
      imobiliariaId: 1,
      origem: "link-corretor-leandro-santos",
      mensagem: "Interesse no apto 201",
    });

    expect(result.id).toBe(1);
    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({
        nomeCliente: "Maria Silva",
        corretorId: 1,
        origem: "link-corretor-leandro-santos",
      })
    );
  });

  it("listLeads returns leads in descending order", async () => {
    const mockLeads = [
      { id: 2, nomeCliente: "Lead B", createdAt: new Date("2025-06-02") },
      { id: 1, nomeCliente: "Lead A", createdAt: new Date("2025-06-01") },
    ];

    (listLeads as any).mockResolvedValue(mockLeads);

    const result = await listLeads();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2); // mais recente primeiro
  });
});

describe("Acessos DB helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registrarAcesso logs a visit", async () => {
    (registrarAcesso as any).mockResolvedValue(undefined);

    await registrarAcesso({
      corretorId: 1,
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });

    expect(registrarAcesso).toHaveBeenCalledWith({
      corretorId: 1,
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });
  });

  it("countAcessosByCorretor returns grouped counts", async () => {
    const mockCounts = [
      { corretorId: 1, total: 15 },
      { corretorId: 2, total: 8 },
    ];

    (countAcessosByCorretor as any).mockResolvedValue(mockCounts);

    const result = await countAcessosByCorretor();
    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(15);
  });

  it("countLeadsByCorretor returns grouped counts", async () => {
    const mockCounts = [
      { corretorId: 1, total: 5 },
      { corretorId: 2, total: 3 },
    ];

    (countLeadsByCorretor as any).mockResolvedValue(mockCounts);

    const result = await countLeadsByCorretor();
    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(5);
  });
});
