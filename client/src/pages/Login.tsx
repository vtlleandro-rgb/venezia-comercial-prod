import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  // Se já autenticado, redirecionar
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });
  useEffect(() => {
    if (user) window.location.href = "/corretor";
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao fazer login.");
        return;
      }
      // Invalidar cache do auth.me antes de redirecionar
      await utils.auth.me.invalidate();
      const dest = data.role === "admin" ? "/admin/corretores" : "/corretor";
      window.location.href = dest;
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src="/assets/venezia/logo-venezia.webp"
            alt="Residencial Venezia"
            className="h-14 mx-auto mb-6 object-contain"
          />
          <h1 className="text-xl font-light text-stone-100 tracking-widest uppercase">
            Área Restrita
          </h1>
          <p className="text-sm text-stone-500 mt-1">Central Comercial</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">
              E-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-medium py-2.5 rounded text-sm uppercase tracking-wider transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-600">
          Residencial Venezia — SPE-VENEZIA Empreendimentos Imobiliários
        </p>
      </div>
    </div>
  );
}
