import type { Express } from "express";

// Assets locais servidos pelo Express em /assets — não há mais dependência do Manus Storage.
// Esta função é mantida como no-op para compatibilidade com server/_core/index.ts.
export function registerStorageProxy(_app: Express) {
  // Assets estáticos em /assets/venezia/ são servidos diretamente pelo middleware
  // express.static apontado para client/public — nenhum proxy necessário.
}
