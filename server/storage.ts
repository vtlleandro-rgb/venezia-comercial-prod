const PUBLIC_UPLOAD_BASE = process.env.PUBLIC_UPLOAD_BASE ?? "/assets/uploads";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function publicUrlFor(key: string): string {
  return `${PUBLIC_UPLOAD_BASE.replace(/\/+$/, "")}/${key}`;
}

export async function storagePut(
  relKey: string,
  _data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  throw new Error(
    `Storage upload is not configured for this deployment. Configure an S3/R2 bucket and save ${key}, then return ${publicUrlFor(key)}.`,
  );
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: publicUrlFor(key) };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  return publicUrlFor(normalizeKey(relKey));
}
