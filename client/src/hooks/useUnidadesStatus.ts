import { useState, useEffect, useCallback } from "react";
import { UNIDADES, type UnidadeStatus } from "@/data/empreendimento";

const STORAGE_KEY = "venezia_unidades_status";
const EVENT_NAME = "venezia-status-update";

/**
 * Hook centralizado para gerenciar e sincronizar o status das unidades
 * entre todos os módulos (Tabela, Dashboard, Navegação).
 * 
 * Escuta tanto o evento customizado quanto o evento de storage (multi-tab).
 */
export function useUnidadesStatus() {
  const [unidadesStatus, setUnidadesStatus] = useState<Record<string, UnidadeStatus>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return Object.fromEntries(UNIDADES.map((u) => [u.id, u.status]));
  });

  // Sincronizar quando outro componente ou aba atualizar
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUnidadesStatus(JSON.parse(saved));
      }
    };

    // Evento customizado (mesma aba, entre componentes)
    window.addEventListener(EVENT_NAME, handleUpdate);
    // Evento storage (multi-tab)
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) handleUpdate();
    });

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate as any);
    };
  }, []);

  const updateStatus = useCallback((id: string, novoStatus: UnidadeStatus) => {
    setUnidadesStatus((prev) => {
      const updated = { ...prev, [id]: novoStatus };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_NAME));
      return updated;
    });
  }, []);

  return { unidadesStatus, updateStatus };
}
