import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Unidade } from "@/data/empreendimento";

interface CancelamentoModalProps {
  unidade: Unidade;
  onConfirm: (motivo: string, observacoes: string) => void;
  onClose: () => void;
}

const MOTIVOS_CANCELAMENTO = [
  "Cliente desistiu",
  "Prazo de reserva expirado",
  "Documentação não aprovada",
  "Cliente optou por outra unidade",
  "Condição financeira não atendida",
  "Erro de cadastro",
  "Outro",
];

export default function CancelamentoModal({ unidade, onConfirm, onClose }: CancelamentoModalProps) {
  const [motivo, setMotivo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [confirmacao, setConfirmacao] = useState(false);

  const handleSubmit = () => {
    if (!motivo) return;
    if (!confirmacao) return;
    onConfirm(motivo, observacoes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cancelar Reserva</h3>
              <p className="text-sm text-gray-600">Unidade {unidade.numero} — {unidade.andar}º Andar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              Esta ação irá cancelar a reserva da unidade <strong>{unidade.numero}</strong> e retorná-la ao status <strong>Disponível</strong>. O histórico da reserva será mantido.
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Motivo do Cancelamento <span className="text-red-500">*</span>
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            >
              <option value="">Selecione o motivo...</option>
              {MOTIVOS_CANCELAMENTO.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o cancelamento..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Confirmação */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmacao}
              onChange={(e) => setConfirmacao(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-gray-600">
              Confirmo que desejo cancelar esta reserva. Entendo que a unidade voltará a ficar disponível para novos clientes.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!motivo || !confirmacao}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}
