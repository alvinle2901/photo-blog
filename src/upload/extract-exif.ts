import exifr from 'exifr';
import { DEFAULT_ASPECT_RATIO } from '../photo';

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

  return {
    make: data?.Make ?? null,
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
  };
}
