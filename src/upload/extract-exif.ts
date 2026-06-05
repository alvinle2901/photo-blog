import exifr from 'exifr';
import { ExifParserFactory } from 'ts-exif-parser';
import { DEFAULT_ASPECT_RATIO } from '../photo';
import { isExifMakeFujifilm } from '../platforms/fujifilm/server';
import { getFujifilmSimulationFromMakerNote, type FujifilmSimulation } from '../platforms/fujifilm/simulation';
import { getFujifilmRecipeFromMakerNote, type FujifilmRecipe } from '../platforms/fujifilm/recipe';

export type ExtractedExif = {
  make: string | null;
  model: string | null;
  focalLength: number | null;
  focalLength35mm: number | null;
  fStop: number | null;
  iso: number | null;
  exposureTime: number | null;
  exposureComp: number | null;
  latitude: number | null;
  longitude: number | null;
  takenAt: Date | null;
  takenAtNaive: string | null;
  aspectRatio: number;
  extension: string;
  filmSimulation: FujifilmSimulation | null;
  recipeData: FujifilmRecipe | null;
};

export async function extractExif(
  buffer: Buffer,
  fileName: string,
): Promise<ExtractedExif> {
  const data = await exifr.parse(buffer, {
    tiff: true,
    exif: true,
    gps: true,
    xmp: true,
    icc: false,
    iptc: false,
  }).catch(() => null);

  const width: number | undefined = data?.ImageWidth ?? data?.ExifImageWidth;
  const height: number | undefined = data?.ImageHeight ?? data?.ExifImageHeight;
  const isRotated = [5, 6, 7, 8].includes(data?.Orientation ?? 0);

  const effectiveWidth = isRotated ? height : width;
  const effectiveHeight = isRotated ? width : height;
  const aspectRatio = effectiveWidth && effectiveHeight
    ? effectiveWidth / effectiveHeight
    : DEFAULT_ASPECT_RATIO;

  // Parse naive datetime string (no timezone, as shot)
  const takenAtRaw: string | undefined = data?.DateTimeOriginal
    ? data.DateTimeOriginal instanceof Date
      ? data.DateTimeOriginal.toISOString()
      : String(data.DateTimeOriginal)
    : undefined;

  const takenAt = data?.DateTimeOriginal instanceof Date
    ? data.DateTimeOriginal
    : takenAtRaw
      ? new Date(takenAtRaw)
      : null;

  const takenAtNaive = takenAtRaw?.slice(0, 19) ?? null;

  const extension = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';

  // --- Film simulation + recipe (Fujifilm only) ---
  let filmSimulation: FujifilmSimulation | null = null;
  let recipeData: FujifilmRecipe | null = null;

  const make: string | null = data?.Make ?? null;
  if (isExifMakeFujifilm(make ?? undefined)) {
    console.log('Fujifilm EXIF detected; attempting to extract film simulation and recipe data from MakerNote');
    try {
      const parser = ExifParserFactory.create(buffer);
      parser.enableBinaryFields(true);
      const binaryExif = parser.parse();
      console.log('Parsed EXIF data with ts-exif-parser', binaryExif);
      const makerNote = binaryExif.tags?.MakerNote;
      if (Buffer.isBuffer(makerNote)) {
        filmSimulation = getFujifilmSimulationFromMakerNote(makerNote) ?? null;
        recipeData = getFujifilmRecipeFromMakerNote(makerNote);
      }
    } catch {
      // MakerNote parsing is best-effort; don't fail the whole upload
    }
  }

  return {
    make,
    model: data?.Model ?? null,
    focalLength: data?.FocalLength ?? null,
    focalLength35mm: data?.FocalLengthIn35mmFormat ?? null,
    fStop: data?.FNumber ?? null,
    iso: data?.ISO ?? null,
    exposureTime: data?.ExposureTime ?? null,
    exposureComp: data?.ExposureCompensation ?? null,
    latitude: data?.latitude ?? null,
    longitude: data?.longitude ?? null,
    takenAt,
    takenAtNaive,
    aspectRatio,
    extension,
    filmSimulation,
    recipeData,
  };
}
