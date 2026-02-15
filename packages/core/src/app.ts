import { createServer, IncomingMessage, ServerResponse, Server } from "node:http";
import { Router } from "./router.js";
import type { Context, Handler, Method } from "./types.js";
import { Container } from "./container.js";
import { createContext } from "./ctx.js";

export class App {
  private server?: Server;
  private router = new Router<Context>();
  public container: Container = new Container();
  private errorHandler: (error: Error, ctx: Context) => void;
  private maxBodySize: number = 10 * 1024 * 1024; // 10MB default


  constructor() {
    this.errorHandler = (error, ctx) => {
      console.error("Unhandled error:", error);
      if (!ctx.res.writableEnded) {
        const isProd = process.env.NODE_ENV === "production";
        ctx.json({ error: isProd ? "Internal server error" : error.message, ...(isProd ? {} : { stack: error.stack }) }, 500);
      }
    };
  }

  get(path: string, handler: Handler) {
    this.router.add("GET", path, handler);
  }

  post(path: string, handler: Handler) {
    this.router.add("POST", path, handler);
  }

  put(path: string, handler: Handler) {
    this.router.add("PUT", path, handler);
  }

  delete(path: string, handler: Handler) {
    this.router.add("DELETE", path, handler);
  }

  patch(path: string, handler: Handler) {
    this.router.add("PATCH", path, handler);
  }

  setMaxBodySize(size: number) {
    this.maxBodySize = size;
  }

  onError(handler: (error: Error, ctx: Context) => void) {
    this.errorHandler = handler;
  }

  private readonly requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { url, method } = req;
      if (!url || !method) {
        res.writeHead(400).end();
        return;
      }
      // Parse pathname (fast)
      const queryIdx = url.indexOf("?");
      //const pathname = queryIdx === -1 ? url : url.substring(0, queryIdx);
      const pathname = queryIdx === -1 ? url : url.slice(0, queryIdx);
      // Route matching
      const matchRoute = this.router.match(method as Method, pathname);
      if (!matchRoute) {
        res.writeHead(404).end("Not Found");
        return;
      }
      // Create context
      const ctx = createContext(req, res, matchRoute);
      // Parse body if needed
      if (method === "POST" || method === "PUT" || (method === "PATCH" && req.headers["content-length"] !== "0")) {
        try {
          await this.parseRequestBody(req, ctx);
        } catch (err) {
          ctx.json({ error: "Invalid request body" }, 400);
          return;
        }
      }
      // Execute handler
      const result = await matchRoute.route.handler(ctx);
      if (res.writableEnded || result instanceof Response) {
        return;
      }
      ///
      if (result !== undefined) {
        if (typeof result === "string") {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(result);
        } else if (typeof result === "object") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        }
      }
      // Log request
      //console.log(`${method} ${pathname} ${res.statusCode} ${duration}ms`);
    } catch (error) {
      // Global error handling
      const ctx = createContext(req, res);
      this.errorHandler(error as Error, ctx);
    }
  };

  private async parseRequestBody(req: IncomingMessage, ctx: Context) {
    const contentType = req.headers["content-type"] || "";
    let size = 0;
    const chunks: Buffer[] = [];

    for await (const chunk of req) {
      size += chunk.length;
      if (size > this.maxBodySize) {
        throw new Error(`Body exceeds ${this.maxBodySize} bytes limit`);
      }
      chunks.push(chunk);
    }

    if (chunks.length === 0) {
      ctx.body = null;
      return;
    }

    const buffer = Buffer.concat(chunks);

    if (contentType.includes("application/json")) {
      ctx.body = JSON.parse(buffer.toString("utf8"));
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      ctx.body = this.parseFormUrlEncoded(buffer.toString("utf8"));
    } else if (contentType.startsWith("text/")) {
      ctx.body = buffer.toString("utf8");
    } else {
      ctx.body = buffer;
    }
  }

  /* private parseFormUrlEncoded(data: string): Record<string, string> {
    const result: Record<string, string> = {};
    const pairs = data.split("&");

    for (const pair of pairs) {
      const [key, value = ""] = pair.split("=");
      if (key) {
        result[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
      }
    }
    return result;
  } */

  private parseFormUrlEncoded(data: string): Record<string, string> {
    const result: Record<string, string> = Object.create(null);
    let key = "",
      value = "",
      parsingKey = true;

    for (let i = 0; i <= data.length; i++) {
      const char = data.charCodeAt(i);

      if (char === 61 /* = */ && parsingKey) {
        parsingKey = false;
      } else if (char === 38 /* & */ || i === data.length) {
        if (key) {
          result[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
        }
        key = "";
        value = "";
        parsingKey = true;
      } else {
        parsingKey ? (key += data[i]) : (value += data[i]);
      }
    }
    return result;
  }

  serve(port: number, callback?: () => void): Server {
    this.server = createServer(
      {
        keepAlive: true,
        keepAliveTimeout: 5000,
        headersTimeout: 8000,
        requestTimeout: 15000,
      },
      this.requestHandler,
    );
    this.server.setMaxListeners(0);

    this.server.listen(port, callback);
    return this.server;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((err) => {
        if (err) reject(err);
        else {
          resolve();
        }
      });
    });
  }
}
