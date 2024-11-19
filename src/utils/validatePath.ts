export const checkPathPrefix = (pathname: any, prefix: string) =>
  pathname.toLowerCase().startsWith(prefix);

export const isPathGrid = (pathname?: string) => checkPathPrefix(pathname, '/grid');
