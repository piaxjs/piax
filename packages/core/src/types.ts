import type { IncomingMessage, ServerResponse } from "node:http";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface Context {
  req: IncomingMessage;
  res: ServerResponse;
  method: Method;
  path: string;
  fullPath?: string; // has query
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  params: Record<string, unknown>;
  query: Record<string, string | string[]>;
  searchParams?: URLSearchParams; // Optional
  status: (status?: number) => void;
  json: (data: unknown, status?: number) => void;
  text: (data: string, status?: number) => void;
  html: (data: string, status?: number) => void;
  param: (key: string) => string | undefined; // Helper
}

//export type Handler<TContext = Context> = (ctx: Context) => void | Promise<void>;
export type HandlerResponse = Response | string | object | void | Promise<Response | string | object | void>;
export type Handler<TContext = Context> = (ctx: TContext) => HandlerResponse;
