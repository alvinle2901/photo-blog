import exifr from "exifr";
import sharp from "sharp";
import { ExifParserFactory } from "ts-exif-parser";
import { DEFAULT_ASPECT_RATIO } from "../photo";
import {
	type FujifilmRecipe,
	getFujifilmRecipeFromMakerNote,
} from "../platforms/fujifilm/recipe";
import { isExifMakeFujifilm } from "../platforms/fujifilm/server";
import {
	type FujifilmSimulation,
	getFujifilmSimulationFromMakerNote,
} from "../platforms/fujifilm/simulation";

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
	const data = await exifr
		.parse(buffer, {
			tiff: true,
			exif: true,
			gps: true,
			xmp: true,
			icc: false,
			iptc: false,
		})
		.catch(() => null);

	const aspectRatio = await getAspectRatioFromImage(buffer, data);

	// Parse naive datetime string (no timezone, as shot)
	const takenAtRaw: string | undefined = data?.DateTimeOriginal
		? data.DateTimeOriginal instanceof Date
			? data.DateTimeOriginal.toISOString()
			: String(data.DateTimeOriginal)
		: undefined;

	const takenAt =
		data?.DateTimeOriginal instanceof Date
			? data.DateTimeOriginal
			: takenAtRaw
				? new Date(takenAtRaw)
				: null;

	const takenAtNaive = takenAtRaw?.slice(0, 19) ?? null;

	const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";

	// --- Film simulation + recipe (Fujifilm only) ---
	let filmSimulation: FujifilmSimulation | null = null;
	let recipeData: FujifilmRecipe | null = null;

	const make: string | null = data?.Make ?? null;
	if (isExifMakeFujifilm(make ?? undefined)) {
		console.log(
			"Fujifilm EXIF detected; attempting to extract film simulation and recipe data from MakerNote",
		);
		try {
			const parser = ExifParserFactory.create(buffer);
			parser.enableBinaryFields(true);
			const binaryExif = parser.parse();
			console.log("Parsed EXIF data with ts-exif-parser", binaryExif);
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

type ExifLike = Record<string, unknown> | null;

async function getAspectRatioFromImage(
	buffer: Buffer,
	data: ExifLike,
): Promise<number> {
	const sharpMeta = await sharp(buffer)
		.metadata()
		.catch(() => null);
	const sharpWidth = toPositiveNumber(sharpMeta?.width);
	const sharpHeight = toPositiveNumber(sharpMeta?.height);

	if (sharpWidth && sharpHeight) {
		const orientation = sharpMeta?.orientation;
		const needsSwap =
			orientation != null && orientation >= 5 && orientation <= 8;
		const width = needsSwap ? sharpHeight : sharpWidth;
		const height = needsSwap ? sharpWidth : sharpHeight;
		return width / height;
	}

	const exifWidth = pickDimension(data, [
		"ExifImageWidth",
		"ImageWidth",
		"PixelXDimension",
		"FileImageWidth",
		"width",
	]);
	const exifHeight = pickDimension(data, [
		"ExifImageHeight",
		"ImageHeight",
		"PixelYDimension",
		"FileImageHeight",
		"height",
	]);

	if (exifWidth && exifHeight) {
		const orientation = pickDimension(data, ["Orientation"]);
		const needsSwap =
			orientation != null && orientation >= 5 && orientation <= 8;
		const width = needsSwap ? exifHeight : exifWidth;
		const height = needsSwap ? exifWidth : exifHeight;
		return width / height;
	}

	return DEFAULT_ASPECT_RATIO;
}

function pickDimension(data: ExifLike, keys: string[]): number | null {
	if (!data) return null;
	for (const key of keys) {
		const value = toPositiveNumber(data[key]);
		if (value != null) return value;
	}
	return null;
}

function toPositiveNumber(value: unknown): number | null {
	if (typeof value === "number") {
		return Number.isFinite(value) && value > 0 ? value : null;
	}
	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
	}
	return null;
}
