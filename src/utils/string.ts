export const checkPathPrefix = (pathname: any, prefix: string) =>
  pathname.toLowerCase().startsWith(prefix);

export const isPathGrid = (pathname?: string) => checkPathPrefix(pathname, '/grid');

export const getShortenLocation = (location: string) => {
  const data = location.split(',');

  if (data.length >= 3) {
    return data[0] + ', ' + data[data.length - 1];
  } else return location;
};

export const shortenUrl = (url?: string) =>
  url ? url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').replace(/\/$/, '') : undefined;

export const getPathShare = (id: string) => {
  return process.env.NEXT_PUBLIC_APP_URL + 'p/' + id;
};

export const generateXPostText = (path: string, text: string) => {
  const url = new URL('https://x.com/intent/tweet');
  url.searchParams.set('url', path);
  url.searchParams.set('text', text);
  return url.toString();
};

export const createFacebookShareLink = (url: string) => {
  const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  console.log(link)
  return link;
};
