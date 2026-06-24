import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";

export interface LogEntry {
  id: string;
  unidade: string;
  statusAnterior: string;
  statusNovo: string;
  usuario: string;
  data: string;
  detalhes?: string;
  tipo?: "reserva" | "cancelamento" | "venda" | "distrato" | "alteracao";
  motivo?: string;
}

export interface DadosVenda {
  comprador: string;
  cpf?: string;
  telefone?: string;
  imobiliaria: string;
  corretor: string;
  dataAssinatura: string;
  valorSemDocumentacao: number;
  valorFinanciamento: number;
  fgts: number;
  entrada: number;
  observacoes?: string;
}

export interface CancelamentoReserva {
  id: string;
  unidadeId: string;
  unidadeNumero: string;
  motivo: string;
  observacoes?: string;
  usuario: string;
  data: string;
  dadosReservaAnterior?: DadosVenda;
}

export interface PropostaRegistro {
  id: string;
  unidadeId: string;
  unidadeNumero: string;
  comprador: string;
  cpf?: string;
  telefone?: string;
  imobiliaria: string;
  corretor: string;
  valorBase: number;
  tipoValor: string;
  entrada: number;
  financiamento: number;
  fgts: number;
  observacoes?: string;
  dataGeracao: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  log: LogEntry[];
  addLog: (entry: Omit<LogEntry, "id" | "data">) => void;
  dadosVenda: Record<string, DadosVenda>;
  salvarDadosVenda: (unidadeId: string, dados: DadosVenda) => void;
  cancelamentos: CancelamentoReserva[];
  addCancelamento: (cancelamento: Omit<CancelamentoReserva, "id" | "data">) => void;
  propostas: PropostaRegistro[];
  addProposta: (proposta: Omit<PropostaRegistro, "id" | "dataGeracao">) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  logout: () => {},
  log: [],
  addLog: () => {},
  dadosVenda: {},
  salvarDadosVenda: () => {},
  cancelamentos: [],
  addCancelamento: () => {},
  propostas: [],
  addProposta: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const isAuthenticated = Boolean(meQuery.data);

  const [log, setLog] = useState<LogEntry[]>([]);
  const [dadosVenda, setDadosVenda] = useState<Record<string, DadosVenda>>({});
  const [cancelamentos, setCancelamentos] = useState<CancelamentoReserva[]>([]);
  const [propostas, setPropostas] = useState<PropostaRegistro[]>([]);

  const snapshotQuery = trpc.comercial.snapshot.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const addLogMutation = trpc.comercial.addLog.useMutation();
  const salvarVendaMutation = trpc.comercial.salvarVenda.useMutation();
  const addCancelamentoMutation = trpc.comercial.addCancelamento.useMutation();
  const addPropostaComercialMutation = trpc.comercial.addPropostaComercial.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: async () => {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    },
  });

  useEffect(() => {
    const snapshot = snapshotQuery.data;
    if (!snapshot) return;

    setLog(snapshot.logs.map((item) => ({
      id: item.id,
      unidade: item.unidade,
      statusAnterior: item.statusAnterior,
      statusNovo: item.statusNovo,
      usuario: item.usuario,
      data: new Date(item.data).toISOString(),
      detalhes: item.detalhes ?? undefined,
      tipo: item.tipo as LogEntry["tipo"] | undefined,
      motivo: item.motivo ?? undefined,
    })));

    setDadosVenda(Object.fromEntries(snapshot.vendas.map((item) => [item.unidadeId, {
      comprador: item.comprador,
      cpf: item.cpf ?? undefined,
      telefone: item.telefone ?? undefined,
      imobiliaria: item.imobiliaria,
      corretor: item.corretor,
      dataAssinatura: item.dataAssinatura,
      valorSemDocumentacao: item.valorSemDocumentacao,
      valorFinanciamento: item.valorFinanciamento,
      fgts: item.fgts,
      entrada: item.entrada,
      observacoes: item.observacoes ?? undefined,
    }])));

    setCancelamentos(snapshot.cancelamentos.map((item) => ({
      id: item.id,
      unidadeId: item.unidadeId,
      unidadeNumero: item.unidadeNumero,
      motivo: item.motivo,
      observacoes: item.observacoes ?? undefined,
      usuario: item.usuario,
      data: new Date(item.data).toISOString(),
      dadosReservaAnterior: item.dadosReservaAnterior ? JSON.parse(item.dadosReservaAnterior) : undefined,
    })));

    setPropostas(snapshot.propostasComerciais.map((item) => ({
      id: item.id,
      unidadeId: item.unidadeId,
      unidadeNumero: item.unidadeNumero,
      comprador: item.comprador,
      cpf: item.cpf ?? undefined,
      telefone: item.telefone ?? undefined,
      imobiliaria: item.imobiliaria,
      corretor: item.corretor,
      valorBase: item.valorBase,
      tipoValor: item.tipoValor,
      entrada: item.entrada,
      financiamento: item.financiamento,
      fgts: item.fgts,
      observacoes: item.observacoes ?? undefined,
      dataGeracao: new Date(item.dataGeracao).toISOString(),
    })));
  }, [snapshotQuery.data]);

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "data">) => {
    const newEntry: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
    };
    setLog((prev) => {
      const updated = [newEntry, ...prev].slice(0, 200);
      addLogMutation.mutate(entry);
      return updated;
    });
  }, [addLogMutation]);

  const salvarDadosVenda = useCallback((unidadeId: string, dados: DadosVenda) => {
    setDadosVenda((prev) => {
      const updated = { ...prev, [unidadeId]: dados };
      salvarVendaMutation.mutate({ unidadeId, ...dados });
      return updated;
    });
  }, [salvarVendaMutation]);

  const addCancelamento = useCallback((cancelamento: Omit<CancelamentoReserva, "id" | "data">) => {
    const newCancelamento: CancelamentoReserva = {
      ...cancelamento,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
    };
    setCancelamentos((prev) => {
      const updated = [newCancelamento, ...prev].slice(0, 200);
      addCancelamentoMutation.mutate(cancelamento);
      return updated;
    });
  }, [addCancelamentoMutation]);

  const addProposta = useCallback((proposta: Omit<PropostaRegistro, "id" | "dataGeracao">) => {
    const newProposta: PropostaRegistro = {
      ...proposta,
      id: crypto.randomUUID(),
      dataGeracao: new Date().toISOString(),
    };
    setPropostas((prev) => {
      const updated = [newProposta, ...prev].slice(0, 200);
      addPropostaComercialMutation.mutate(proposta);
      return updated;
    });
  }, [addPropostaComercialMutation]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, log, addLog, dadosVenda, salvarDadosVenda, cancelamentos, addCancelamento, propostas, addProposta }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
