import type { IncomingMessage, ServerResponse } from "node:http";
import type { Context, Method } from "./types.js";
import type { Route, RouteMatch } from "./router.js";

// query parser (singleton)
const queryParsers = {
  // Simple query
  fastParse(queryString: string): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};
    let start = 0;
    const length = queryString.length;
    for (let i = 0; i <= length; i++) {
      const char = queryString[i];
      if (char === "&" || i === length) {
        if (start < i) {
          const pair = queryString.substring(start, i);
          const eqIndex = pair.indexOf("=");
          const key = eqIndex === -1 ? decodeURIComponent(pair) : decodeURIComponent(pair.substring(0, eqIndex));
          const value = eqIndex === -1 || eqIndex === pair.length - 1 ? "" : decodeURIComponent(pair.substring(eqIndex + 1));
          // Add to result
          const existing = result[key];
          if (existing !== undefined) {
            if (Array.isArray(existing)) {
              existing.push(value);
            } else {
              result[key] = [existing, value];
            }
          } else {
            result[key] = value;
          }
        }
        start = i + 1;
      }
    }
    return result;
  },
};

export function createContext(req: IncomingMessage, res: ServerResponse, matchRoute?: RouteMatch): Context {
  const url = req.url || "/";
  const queryStart = url.indexOf("?");
  const hasQuery = queryStart !== -1;
  ///
  const queryString = hasQuery ? url.substring(queryStart + 1) : "";
  const pathname = hasQuery ? url.substring(0, queryStart) : url;
  ///
  let _queryCache: Record<string, string | string[]> | null = null;
  ///
  const context: Context = {
    req,
    res,
    method: (req.method || "GET") as Method,
    path: pathname,
    fullPath: url,
    params: matchRoute?.params || {},
    headers: req.headers,
    body: undefined,
    get query(): Record<string, string | string[]> {
      if (!_queryCache) {
        _queryCache = queryString ? queryParsers.fastParse(queryString) : {};
      }
      return _queryCache;
    },
    param(key: string): string | undefined {
      return matchRoute?.params?.[key] as string | undefined;
    },
    status(status = 200) {
      if (res.writableEnded) return;
      res.statusCode = status;
    },
    json(data: unknown, status = 200) {
      if (res.writableEnded) return;
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    },
    text(data: string, status = 200) {
      if (res.writableEnded) return;
      res.statusCode = status;
      res.setHeader("Content-Type", "text/plain");
      res.end(data);
    },
    html(data: string, status = 200) {
      if (res.writableEnded) return;
      res.statusCode = status;
      res.setHeader("Content-Type", "text/html");
      res.end(data);
    },
  };

  return context;
}
