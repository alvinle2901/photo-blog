import type { Photo } from '@/photo';

export const YEAR_GRID_INITIAL = 48;

export function absolutePathForYear(year: string): string {
  return `/year/${encodeURIComponent(year)}`;
}

export function absolutePathForPhoto(year: string, photoId: string): string {
  return `/year/${encodeURIComponent(year)}/${photoId}`;
}

export function absolutePathForYearImage(year: string): string {
  return `/year/${encodeURIComponent(year)}/image`;
}

export function titleForYear(year: string, count: number): string {
  return `${year} (${count} ${count === 1 ? 'photo' : 'photos'})`;
}

export function descriptionForYear(year: string, count: number): string {
  return `${count} ${count === 1 ? 'photo' : 'photos'} from ${year}.`;
}

export function titleForPhoto(photo: Photo): string {
  return photo.title || photo.caption || `Photo ${photo.id}`;
}

export function descriptionForPhoto(photo: Photo, html = false): string {
  const parts = [photo.caption, photo.semanticDescription].filter(Boolean) as string[];
  const raw = parts.join(' ').trim() || `Photo ${photo.id}`;
  return html ? raw : raw.replace(/<[^>]+>/g, '');
}

export function generateMetaForYear(
  year: string,
  photos: Photo[],
  explicitCount?: number,
) {
  const count = explicitCount ?? photos.length;
  const title = titleForYear(year, count);
  const description = descriptionForYear(year, count);

  return {
    url: absolutePathForYear(year),
    title,
    description,
    images: photos[0]?.url ? [photos[0].url] : undefined,
  };
}
