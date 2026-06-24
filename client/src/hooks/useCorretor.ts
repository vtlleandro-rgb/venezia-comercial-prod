import { useEffect, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook que lê o parâmetro ?corretor=slug da URL e busca os dados do corretor via tRPC.
 * Também registra o acesso automaticamente (uma vez por sessão).
 */
export function useCorretor() {
  const slug = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("corretor") || null;
  }, []);

  const { data: corretor, isLoading } = trpc.corretores.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug, staleTime: 1000 * 60 * 30 } // cache 30 min
  );

  // Registrar acesso uma vez por sessão
  const registrarAcesso = trpc.acessos.registrar.useMutation();
  const acessoRegistrado = useRef(false);

  useEffect(() => {
    if (corretor && corretor.id && !acessoRegistrado.current) {
      acessoRegistrado.current = true;
      registrarAcesso.mutate({
        corretorId: corretor.id,
        userAgent: navigator.userAgent,
      });
    }
  }, [corretor]);

  return {
    slug,
    corretor: corretor ?? null,
    isLoading: !!slug && isLoading,
    hasCorretor: !!corretor,
  };
}
