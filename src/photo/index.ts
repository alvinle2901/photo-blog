import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { photos } from '../db/schema';

/** Raw row shape from the database */
export type PhotoRow = InferSelectModel<typeof photos>;

/** Shape for inserting a new photo */
export type PhotoInsert = InferInsertModel<typeof photos>;

/** Domain model — what the app works with after parsing */
export type Photo = {
  id: string;
  url: string;
  extension: string;
  aspectRatio: number;
  blurData: string | null;
  colorData: PhotoColorData | null;
  title: string | null;
  caption: string | null;
  semanticDescription: string | null;
  tags: string[] | null;
  takenAt: Date | null;
  takenAtNaive: string | null;
  // Camera
  make: string | null;
  model: string | null;
  // Lens
  focalLength: number | null;
  focalLength35mm: number | null;
  fStop: number | null;
  iso: number | null;
  exposureTime: number | null;
  exposureComp: number | null;
  // Location
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  // Film
  filmSimulation: string | null;
  recipeTitle: string | null;
  recipeData: unknown | null;
  // Meta
  hidden: boolean;
  priorityOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PhotoColorData = {
  average: Oklch;
  colors: Oklch[];
  ai?: Oklch;
};

export type Oklch = {
  l: number;
  c: number;
  h: number;
};

export const DEFAULT_ASPECT_RATIO = 3 / 2;

/** Map a raw DB row to the domain Photo type */
export function rowToPhoto(row: PhotoRow): Photo {
  return {
    ...row,
    colorData: row.colorData as PhotoColorData | null,
  };
}
