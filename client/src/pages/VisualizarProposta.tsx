import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

export default function VisualizarProposta() {
  const [, params] = useRoute("/proposta/:codigo");
  const codigo = params?.codigo || "";

  const { data: proposta, isLoading, error } = trpc.propostas.getByCodigo.useQuery(
    { codigo },
    { enabled: !!codigo }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (error || !proposta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Proposta não encontrada</h1>
          <p className="text-gray-600">O código informado não corresponde a nenhuma proposta ativa.</p>
          <a href="/" className="mt-4 inline-block text-emerald-600 hover:underline">
            Voltar ao site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        dangerouslySetInnerHTML={{ __html: proposta.htmlContent }}
        className="proposta-viewer"
      />
      <style>{`
        .proposta-viewer { all: initial; font-family: system-ui, sans-serif; }
        .proposta-viewer * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
