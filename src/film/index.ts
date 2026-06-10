import type { Photo } from '@/photo';
import {
  labelForFujifilmSimulation,
  type FujifilmSimulation,
} from '@/platforms/fujifilm/simulation';

export const FILM_GRID_INITIAL = 48;

export function labelForFilm(film: string): string {
  const normalized = film.trim();
  if (!normalized) {
    return 'Unknown Film';
  }

  return labelForFujifilmSimulation(normalized as FujifilmSimulation);
}

export function titleForFilm(film: string, count: number): string {
  const label = labelForFilm(film);
  const noun = count === 1 ? 'photo' : 'photos';
  return `${label} (${count} ${noun})`;
}

export function descriptionForFilm(film: string, count: number): string {
  const label = labelForFilm(film);
  const noun = count === 1 ? 'photo' : 'photos';
  return `${count} ${noun} shot with ${label}.`;
}

export function titleForPhoto(photo: Photo): string {
  return photo.title || photo.caption || `Photo ${photo.id}`;
}

export function descriptionForPhoto(photo: Photo, html = false): string {
  const parts = [photo.caption, photo.semanticDescription].filter(Boolean) as string[];
  const raw = parts.join(' ').trim() || `Photo ${photo.id}`;
  return html ? raw : raw.replace(/<[^>]+>/g, '');
}

export function absolutePathForFilm(film: string): string {
  return `/film/${encodeURIComponent(film)}`;
}

export function absolutePathForPhoto(film: string, photoId: string): string {
  return `/film/${encodeURIComponent(film)}/${photoId}`;
}

export function absolutePathForFilmImage(film: string): string {
  return `/film/${encodeURIComponent(film)}/image`;
}

export function generateMetaForFilm(
  film: string,
  photos: Photo[],
  explicitCount?: number,
) {
  const count = explicitCount ?? photos.length;
  const title = titleForFilm(film, count);
  const description = descriptionForFilm(film, count);

  return {
    url: absolutePathForFilm(film),
    title,
    description,
    images: photos[0]?.url ? [photos[0].url] : undefined,
  };
}
