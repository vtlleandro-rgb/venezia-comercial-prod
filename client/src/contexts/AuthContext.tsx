import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Senha padrão de acesso restrito
const SENHA_PADRAO = "venezia2025";

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
  authenticate: (senha: string) => boolean;
  logout: () => void;
  senha: string;
  alterarSenha: (senhaAtual: string, senhaNova: string) => boolean;
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
  authenticate: () => false,
  logout: () => {},
  senha: SENHA_PADRAO,
  alterarSenha: () => false,
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("venezia_auth") === "true";
  });

  const [senha, setSenha] = useState<string>(() => {
    return localStorage.getItem("venezia_senha") || SENHA_PADRAO;
  });

  const [log, setLog] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem("venezia_log");
    return saved ? JSON.parse(saved) : [];
  });

  const [dadosVenda, setDadosVenda] = useState<Record<string, DadosVenda>>(() => {
    const saved = localStorage.getItem("venezia_dados_venda");
    return saved ? JSON.parse(saved) : {};
  });

  const [cancelamentos, setCancelamentos] = useState<CancelamentoReserva[]>(() => {
    const saved = localStorage.getItem("venezia_cancelamentos");
    return saved ? JSON.parse(saved) : [];
  });

  const [propostas, setPropostas] = useState<PropostaRegistro[]>(() => {
    const saved = localStorage.getItem("venezia_propostas");
    return saved ? JSON.parse(saved) : [];
  });

  const authenticate = useCallback((inputSenha: string): boolean => {
    if (inputSenha === senha) {
      setIsAuthenticated(true);
      sessionStorage.setItem("venezia_auth", "true");
      return true;
    }
    return false;
  }, [senha]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("venezia_auth");
  }, []);

  const alterarSenha = useCallback((senhaAtual: string, senhaNova: string): boolean => {
    if (senhaAtual === senha && senhaNova.length >= 4) {
      setSenha(senhaNova);
      localStorage.setItem("venezia_senha", senhaNova);
      return true;
    }
    return false;
  }, [senha]);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "data">) => {
    const newEntry: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
    };
    setLog((prev) => {
      const updated = [newEntry, ...prev].slice(0, 200);
      localStorage.setItem("venezia_log", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const salvarDadosVenda = useCallback((unidadeId: string, dados: DadosVenda) => {
    setDadosVenda((prev) => {
      const updated = { ...prev, [unidadeId]: dados };
      localStorage.setItem("venezia_dados_venda", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCancelamento = useCallback((cancelamento: Omit<CancelamentoReserva, "id" | "data">) => {
    const newCancelamento: CancelamentoReserva = {
      ...cancelamento,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
    };
    setCancelamentos((prev) => {
      const updated = [newCancelamento, ...prev].slice(0, 200);
      localStorage.setItem("venezia_cancelamentos", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addProposta = useCallback((proposta: Omit<PropostaRegistro, "id" | "dataGeracao">) => {
    const newProposta: PropostaRegistro = {
      ...proposta,
      id: crypto.randomUUID(),
      dataGeracao: new Date().toISOString(),
    };
    setPropostas((prev) => {
      const updated = [newProposta, ...prev].slice(0, 200);
      localStorage.setItem("venezia_propostas", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, logout, senha, alterarSenha, log, addLog, dadosVenda, salvarDadosVenda, cancelamentos, addCancelamento, propostas, addProposta }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
