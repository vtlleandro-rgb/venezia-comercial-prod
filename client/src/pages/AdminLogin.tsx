import { FormEvent, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/admin-corretores");
    },
    onError: (err) => {
      setError(err.message || "Não foi possível entrar.");
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    loginMutation.mutate({ password });
  };

  return (
    <main className="min-h-screen bg-[#f7f3ec] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-black/10 rounded-lg p-6 shadow-sm space-y-5">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-11 w-11 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center">
            <Lock size={20} />
          </div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Acesso administrativo</h1>
          <p className="text-sm text-gray-500">Entre para gerenciar corretores, leads e dados comerciais.</p>
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha administrativa"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-[#c62828] hover:bg-[#a91f1f] disabled:opacity-60 text-white rounded-lg py-2.5 font-medium transition-colors"
        >
          {loginMutation.isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
