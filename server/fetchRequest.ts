import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

export function createFetchRequest(
  req: ExpressRequest,
  res: ExpressResponse,
): Request {
  const controller = new AbortController();
  res.on("close", () => controller.abort());

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value !== undefined) headers.set(key, value);
  }

  return new Request(new URL(req.originalUrl, "http://localhost").href, {
    method: req.method,
    headers,
    signal: controller.signal,
  });
}
