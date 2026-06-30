import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Home from "./Home";
import NotFound from "./NotFound";

/**
 * Rota pública /:slug — carrega a Home com o corretor vinculado ao slug.
 * Idêntica à Home normal, mas com o contexto do corretor pré-carregado.
 * Registra acesso automaticamente uma vez por sessão.
 */
export default function PaginaCorretor() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: corretor, isLoading, error } = trpc.corretores.getBySlug.useQuery(
    { slug },
    { enabled: !!slug, staleTime: 1000 * 60 * 30 }
  );

  const registrarAcesso = trpc.acessos.registrar.useMutation();
  const acessoRegistrado = useRef(false);

  useEffect(() => {
    if (corretor?.id && !acessoRegistrado.current) {
      acessoRegistrado.current = true;
      registrarAcesso.mutate({
        corretorId: corretor.id,
        userAgent: navigator.userAgent,
      });
    }
  }, [corretor]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
        <div className="w-8 h-8 border-2 border-[#c62828] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Slug não encontrado em nenhum corretor → 404
  if (!isLoading && (error || corretor === null)) {
    return <NotFound />;
  }

  // Renderiza a Home passando o corretor — WhatsApp, lead e proposta ficam vinculados
  return <Home corretorExterno={corretor ?? undefined} />;
}
