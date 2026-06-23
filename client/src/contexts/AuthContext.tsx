import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Senha padrão de acesso restrito
const SENHA_PADRAO = "venezia2025";

const safeRandomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export interface LogEntry {
  id: string;
  unidade: string;
  statusAnterior: string;
  statusNovo: string;
  usuario: string;
  data: string;
  detalhes?: string;
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
  propostas: [],
  addProposta: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("venezia_auth") === "true";
    } catch {
      return false;
    }
  });

  const [senha, setSenha] = useState<string>(() => {
    try {
      return localStorage.getItem("venezia_senha") || SENHA_PADRAO;
    } catch {
      return SENHA_PADRAO;
    }
  });

  const [log, setLog] = useState<LogEntry[]>(() => {
    return readJsonStorage<LogEntry[]>("venezia_log", []);
  });

  const [dadosVenda, setDadosVenda] = useState<Record<string, DadosVenda>>(() => {
    return readJsonStorage<Record<string, DadosVenda>>("venezia_dados_venda", {});
  });

  const [propostas, setPropostas] = useState<PropostaRegistro[]>(() => {
    return readJsonStorage<PropostaRegistro[]>("venezia_propostas", []);
  });

  const authenticate = useCallback((inputSenha: string): boolean => {
    if (inputSenha === senha) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem("venezia_auth", "true");
      } catch {
        // Sessão ainda funciona em memória.
      }
      return true;
    }
    return false;
  }, [senha]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem("venezia_auth");
    } catch {
      // Nada a fazer.
    }
  }, []);

  const alterarSenha = useCallback((senhaAtual: string, senhaNova: string): boolean => {
    if (senhaAtual === senha && senhaNova.length >= 4) {
      setSenha(senhaNova);
      try {
        localStorage.setItem("venezia_senha", senhaNova);
      } catch {
        // Mantém em memória se o navegador bloquear storage.
      }
      return true;
    }
    return false;
  }, [senha]);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "data">) => {
    const newEntry: LogEntry = {
      ...entry,
      id: safeRandomId(),
      data: new Date().toISOString(),
    };
    setLog((prev) => {
      const updated = [newEntry, ...prev].slice(0, 100);
      try {
        localStorage.setItem("venezia_log", JSON.stringify(updated));
        window.dispatchEvent(new Event("venezia-log-update"));
      } catch {
        // Mantém em memória se storage estiver indisponível.
      }
      return updated;
    });
  }, []);

  const salvarDadosVenda = useCallback((unidadeId: string, dados: DadosVenda) => {
    setDadosVenda((prev) => {
      const updated = { ...prev, [unidadeId]: dados };
      try {
        localStorage.setItem("venezia_dados_venda", JSON.stringify(updated));
        window.dispatchEvent(new Event("venezia-dados-venda-update"));
      } catch {
        // Mantém em memória se storage estiver indisponível.
      }
      return updated;
    });
  }, []);

  const addProposta = useCallback((proposta: Omit<PropostaRegistro, "id" | "dataGeracao">) => {
    const newProposta: PropostaRegistro = {
      ...proposta,
      id: safeRandomId(),
      dataGeracao: new Date().toISOString(),
    };
    setPropostas((prev) => {
      const updated = [newProposta, ...prev].slice(0, 200);
      try {
        localStorage.setItem("venezia_propostas", JSON.stringify(updated));
        window.dispatchEvent(new Event("venezia-propostas-update"));
      } catch {
        // Mantém em memória se storage estiver indisponível.
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, logout, senha, alterarSenha, log, addLog, dadosVenda, salvarDadosVenda, propostas, addProposta }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
