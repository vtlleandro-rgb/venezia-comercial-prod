export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Rota de login interna — autenticação própria por e-mail/senha.
// Substituiu dependência de OAuth externo (Manus) em 2026-06-30. Ver DECISAO 009.
export const getLoginUrl = () => "/login";
