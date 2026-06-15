import { convertRgbToOklab, parseHex } from "culori";
import { extractColors } from "extract-colors";
import { FastAverageColor } from "fast-average-color";
import sharp from "sharp";
import type { Oklch, PhotoColorData } from "../photo";

const NULL_RGB = { r: 0, g: 0, b: 0, mode: "rgb" as const };

function hexToOklch(hex: string): Oklch {
	const rgb = parseHex(hex) ?? NULL_RGB;
	const { a, b, l } = convertRgbToOklab(rgb);
	const c = Math.sqrt(a * a + b * b);
	const _h = Math.atan2(b, a) * (180 / Math.PI);
	const h = _h < 0 ? _h + 360 : _h;
	return {
		l: +l.toFixed(3),
		c: +c.toFixed(3),
		h: +h.toFixed(3),
	};
}

async function getImagePixelData(buffer: Buffer) {
	const image = sharp(buffer);
	const { width, height } = await image.metadata();
	const raw = await image.ensureAlpha().raw().toBuffer();
	return {
		data: new Uint8ClampedArray(raw.buffer),
		width: width!,
		height: height!,
	};
}

export async function generateColorData(
	buffer: Buffer,
): Promise<PhotoColorData> {
	const pixelData = await getImagePixelData(buffer);

	const fac = new FastAverageColor();
	const avgResult = fac.prepareResult(fac.getColorFromArray4(pixelData.data));
	const average = hexToOklch(avgResult.hex);

	const extracted = await extractColors(pixelData);
	const colors = extracted.map(({ hex }) => hexToOklch(hex));

	return { average, colors };
}
