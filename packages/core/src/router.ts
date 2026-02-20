import type { Context, Handler, Method } from "./types.js";

export interface Route {
  method: Method;
  path: string;
  paramNames?: string[];
  pattern?: RegExp;
  handler: Handler<any>;
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
}

export interface RouteInfo {
  method: Method;
  path: string;
  isDynamic: boolean;
}

export class Router {
  private readonly staticRoutes = new Map<Method, Map<string, Route>>();
  private readonly dynamicRoutes = new Map<Method, Route[]>();

  add(method: Method, path: string, handler: Handler<any>) {
    const isDynamic = path.includes(":");

    if (!isDynamic) {
      let methodRoutes = this.staticRoutes.get(method);
      if (!methodRoutes) {
        methodRoutes = new Map();
        this.staticRoutes.set(method, methodRoutes);
      }
      methodRoutes.set(path, { method, path, handler });
      return;
    }

    // dynamic
    const paramNames: string[] = [];
    const pattern = this.pathToRegex(path, paramNames);

    const route: Route = {
      method,
      path,
      paramNames,
      pattern,
      handler,
    };

    let methodRoutes = this.dynamicRoutes.get(method);
    if (!methodRoutes) {
      methodRoutes = [];
      this.dynamicRoutes.set(method, methodRoutes);
    }
    // Order matters: first match wins
    methodRoutes.push(route);
  }

  match(method: Method, path: string): RouteMatch | null {
    // static O(1)
    const staticRoute = this.staticRoutes.get(method)?.get(path);
    if (staticRoute) {
      return { route: staticRoute, params: {} };
    }
    // dynamic (only this method)
    const routes = this.dynamicRoutes.get(method);
    if (!routes) return null;

    for (const route of routes) {
      if (!route.pattern) continue;
      const match = route.pattern.exec(path);
      if (!match) continue;

      const params: Record<string, string> = {};
      const names = route.paramNames!;

      /* for (let i = 0; i < names.length; i++) {
        params[names[i]] = match[i + 1];
      } */

      for (let i = 0, l = names.length; i < l; i++) {
        const value = match[i + 1];
        if (value !== undefined) {
          params[names[i]!] = value;
        }
      }

      return { route, params };
    }

    return null;
  }

  private pathToRegex(path: string, paramNames: string[]): RegExp {
    const segments = path.split("/");
    const regexParts = segments.map((segment) => {
      if (segment.startsWith(":")) {
        const name = segment.slice(1);
        paramNames.push(name);
        return "([^/]+)";
      }
      return segment.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
    });
    return new RegExp(`^${regexParts.join("/")}$`);
  }

  getRoutes(): RouteInfo[] {
    const routes: RouteInfo[] = [];
    // static routes
    for (const [method, methodRoutes] of this.staticRoutes) {
      for (const route of methodRoutes.values()) {
        routes.push({
          method,
          path: route.path,
          isDynamic: false,
        });
      }
    }
    // dynamic routes
    for (const [method, methodRoutes] of this.dynamicRoutes) {
      for (const route of methodRoutes) {
        routes.push({
          method,
          path: route.path,
          isDynamic: true,
        });
      }
    }
    return routes;
  }
}
