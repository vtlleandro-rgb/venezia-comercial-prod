import { useState, useEffect, useCallback } from "react";
import { UNIDADES, type UnidadeStatus } from "@/data/empreendimento";
import { trpc } from "@/lib/trpc";

const EVENT_NAME = "venezia-status-update";

/**
 * Hook centralizado para gerenciar e sincronizar o status das unidades
 * entre todos os módulos (Tabela, Dashboard, Navegação).
 * 
 * Escuta tanto o evento customizado quanto o evento de storage (multi-tab).
 */
export function useUnidadesStatus() {
  const [unidadesStatus, setUnidadesStatus] = useState<Record<string, UnidadeStatus>>(() =>
    Object.fromEntries(UNIDADES.map((u) => [u.id, u.status]))
  );
  const utils = trpc.useUtils();
  const statusQuery = trpc.comercial.statusPublic.useQuery(undefined, { retry: false });
  const updateStatusMutation = trpc.comercial.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.comercial.statusPublic.invalidate();
      await utils.comercial.snapshot.invalidate();
      window.dispatchEvent(new Event(EVENT_NAME));
    },
  });

  useEffect(() => {
    const status = statusQuery.data;
    if (!status) return;
    setUnidadesStatus((prev) => ({
      ...prev,
      ...Object.fromEntries(status.map((item) => [item.unidadeId, item.status as UnidadeStatus])),
    }));
  }, [statusQuery.data]);

  const updateStatus = useCallback((id: string, novoStatus: UnidadeStatus) => {
    setUnidadesStatus((prev) => {
      const updated = { ...prev, [id]: novoStatus };
      updateStatusMutation.mutate({ unidadeId: id, status: novoStatus });
      window.dispatchEvent(new Event(EVENT_NAME));
      return updated;
    });
  }, [updateStatusMutation]);

  return { unidadesStatus, updateStatus };
}
