import type { CookieOptions, Request } from "express";
import { ENV } from "./env";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

function firstHeaderValue(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value.split(",")[0]?.trim();
}

function hostnameFromHost(host: string | undefined) {
  if (!host) return undefined;
  try {
    return new URL(`http://${host}`).hostname.toLowerCase();
  } catch {
    return host.replace(/^\[/, "").replace(/\]$/, "").split(":")[0]?.toLowerCase();
  }
}

function hostnameFromUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function requestHostname(req: Request) {
  return hostnameFromHost(
    firstHeaderValue(req.headers["x-forwarded-host"]) ??
      firstHeaderValue(req.headers.host) ??
      req.hostname
  );
}

function isCrossDomainProductionRequest(req: Request) {
  if (!ENV.isProduction || !ENV.frontendUrl) return false;

  const backendHost = requestHostname(req);
  const frontendHost = hostnameFromUrl(ENV.frontendUrl);
  const originHost = hostnameFromUrl(firstHeaderValue(req.headers.origin));

  if (originHost && backendHost && originHost !== backendHost) return true;
  if (frontendHost && backendHost && frontendHost !== backendHost) return true;

  return false;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const crossDomainProduction = isCrossDomainProductionRequest(req);

  return {
    httpOnly: true,
    path: "/",
    sameSite: crossDomainProduction ? "none" : "lax",
    secure: crossDomainProduction ? true : isSecureRequest(req),
  };
}
