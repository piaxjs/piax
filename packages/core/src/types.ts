import type { IncomingMessage, ServerResponse } from "node:http";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ExtractParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : {};

export interface BaseContext {
  req: IncomingMessage;
  res: ServerResponse;
  method: Method;
  path: string;
  fullPath?: string; // has query
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  status: (status?: number) => void;
  json: (data: unknown, status?: number) => void;
  text: (data: string, status?: number) => void;
  html: (data: string, status?: number) => void;
  param: (key: string) => string; // Helper
}

export type Context<TPath extends string> = Omit<BaseContext, "params"> & {
  params: ExtractParams<TPath>;
};

type HandlerResponse = Response | string | object | void | Promise<Response | string | object | void>;
export type Handler<TPath extends string> = (ctx: Context<TPath>) => HandlerResponse;
