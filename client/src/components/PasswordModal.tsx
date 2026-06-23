import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function PasswordModal({ open, onOpenChange, onSuccess }: PasswordModalProps) {
  const { authenticate } = useAuth();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticate(senha)) {
      setErro(false);
      setSenha("");
      onOpenChange(false);
      onSuccess();
    } else {
      setErro(true);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSenha("");
      setErro(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1a1a2e] font-serif text-xl">
            <Lock size={20} className="text-[#c62828]" />
            Acesso Restrito
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Digite a senha para alterar o status das unidades.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Digite a senha de acesso"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro(false);
              }}
              className={`pr-10 h-11 text-base ${erro ? "border-red-500 ring-red-200 ring-2" : "border-gray-300"}`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {erro && (
            <p className="text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              Senha incorreta. Tente novamente.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors shadow-sm"
            >
              Desbloquear
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
