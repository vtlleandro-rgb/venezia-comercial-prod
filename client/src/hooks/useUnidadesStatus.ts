import { useCallback } from "react";
import { UNIDADES, type UnidadeStatus } from "@/data/empreendimento";
import { trpc } from "@/lib/trpc";

const DEFAULT_STATUS: Record<string, UnidadeStatus> = Object.fromEntries(
  UNIDADES.map((u) => [u.id, u.status])
);

/**
 * Hook centralizado para status das unidades.
 * Fonte oficial: banco Railway (unidades_status).
 * Fallback: status padrão do empreendimento.ts enquanto o banco carrega.
 * localStorage não é mais fonte oficial — apenas o banco importa.
 */
export function useUnidadesStatus() {
  const utils = trpc.useUtils();

  const { data: dbStatus } = trpc.unidades.getStatus.useQuery(undefined, {
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const updateMutation = trpc.unidades.updateStatus.useMutation({
    onSuccess: () => {
      utils.unidades.getStatus.invalidate();
    },
  });

  // Mescla: banco tem prioridade; fallback para padrão enquanto carrega
  const unidadesStatus: Record<string, UnidadeStatus> = {
    ...DEFAULT_STATUS,
    ...(dbStatus ?? {}),
  };

  const updateStatus = useCallback(
    (id: string, novoStatus: UnidadeStatus) => {
      updateMutation.mutate({ unidadeId: id, status: novoStatus });
    },
    [updateMutation]
  );

  return { unidadesStatus, updateStatus };
}
