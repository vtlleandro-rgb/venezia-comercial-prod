import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Bypass de autenticação para homologação local.
// Ativo SOMENTE quando a variável VITE_LOCAL_AUTH_BYPASS=true está no .env
// E o Vite está em modo desenvolvimento (import.meta.env.DEV).
// Nunca ativo em produção — duas condições obrigatórias simultâneas.
const LOCAL_BYPASS_ACTIVE =
  import.meta.env.DEV === true &&
  import.meta.env.VITE_LOCAL_AUTH_BYPASS === "true";

const LOCAL_BYPASS_USER = {
  id: 0,
  openId: "local-dev-bypass",
  name: "Dev Admin (Homologação)",
  email: "dev@venezia.local",
  loginMethod: "bypass",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !LOCAL_BYPASS_ACTIVE,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    if (LOCAL_BYPASS_ACTIVE) {
      return {
        user: LOCAL_BYPASS_USER,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    }
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (LOCAL_BYPASS_ACTIVE) return;
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  const canManage = state.user?.role === "admin" || state.user?.role === "gerente";
  const isAdmin = state.user?.role === "admin";

  return {
    ...state,
    canManage,
    isAdmin,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
