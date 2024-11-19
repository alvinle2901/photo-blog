export const checkPathPrefix = (pathname: any, prefix: string) =>
  pathname.toLowerCase().startsWith(prefix);

export const isPathGrid = (pathname?: string) => checkPathPrefix(pathname, '/grid');

export const getShortenLocation = (location: string) => {
  const data = location.split(',');

  if (data.length >= 3) {
    return data[0] + ', ' + data[data.length - 1];
  } else return location;
};
