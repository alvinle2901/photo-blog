export const checkPathPrefix = (pathname = "", prefix: string) =>
  pathname.toLowerCase().startsWith(prefix);

export const isPathGrid = (pathname?: string) =>
  checkPathPrefix(pathname, "grid");

export const isPathFeed = (pathname?: string) => checkPathPrefix(pathname, "");
