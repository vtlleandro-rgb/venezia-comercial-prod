// Upload de arquivos não é utilizado neste projeto.
// Todos os assets estão em client/public/assets/venezia/ e são servidos
// diretamente pelo Express via express.static — nenhum storage remoto necessário.

export async function storagePut(
  _relKey: string,
  _data: Buffer | Uint8Array | string,
  _contentType?: string,
): Promise<{ key: string; url: string }> {
  throw new Error("storagePut: não implementado — assets são servidos como arquivos estáticos.");
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  return { key, url: `/assets/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = relKey.replace(/^\/+/, "");
  return `/assets/${key}`;
}
