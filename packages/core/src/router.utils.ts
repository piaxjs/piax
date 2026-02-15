/**
 *
 */
export const normalizePath = (path: string): string => {
  let normalized = path.trim();
  if (!normalized.startsWith("/")) {
    normalized = "/" + normalized;
  }
  normalized = normalized.replace(/\/+/g, "/");
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

/// hasDynamicSegments
export const isHasDynamicSegments = (path: string): boolean => {
  return path.includes(":") || path.includes("*");
};

/// pathToRegex
export const pathToRegex = (path: string, paramNames: string[]): RegExp => {
  let regexString = "^";
  let inParam = false;
  let paramName = "";

  for (let i = 0; i < path.length; i++) {
    const char = path[i] as string;
    if (char === ":") {
      inParam = true;
      paramName = "";
      regexString += "([^\\/]+)";
    } else if (inParam && (char === "/" || i === path.length - 1)) {
      if (i === path.length - 1 && char !== "/") {
        paramName += char;
      }
      paramNames.push(paramName);
      inParam = false;
    } else if (inParam) {
      paramName += char;
    } else {
      if ("\\^$*+?.()[]{}|".includes(char)) {
        regexString += "\\";
      }
      regexString += char;
    }
  }
  regexString += "$";
  return new RegExp(regexString);
};
