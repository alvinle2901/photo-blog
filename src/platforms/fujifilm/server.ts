// MakerNote tag IDs and values referenced from:
// - github.com/exiftool/exiftool/blob/master/lib/Image/ExifTool/FujiFilm.pm
// - exiftool.org/TagNames/FujiFilm.html

import { MAKE_FUJIFILM } from ".";

// MakerNote offsets
const BYTE_OFFSET_TAG_COUNT = 12;
const BYTE_OFFSET_FIRST_TAG = 14;

// Tag offsets (relative to tag entry start)
const BYTE_OFFSET_TAG_TYPE = 2;
const BYTE_OFFSET_TAG_SIZE = 4;
const BYTE_OFFSET_TAG_VALUE = 8;

// Tag sizes
const BYTES_PER_TAG = 12;
const BYTES_PER_TAG_VALUE = 4;

export const isExifMakeFujifilm = (make?: string) =>
	make?.toLocaleUpperCase() === MAKE_FUJIFILM;

/**
 * Walk the Fujifilm proprietary IFD inside the MakerNote binary buffer.
 * Calls `sendTagNumbers(tagId, numbers[])` for every numeric tag found.
 */
export const parseFujifilmMakerNote = (
	bytes: Buffer,
	sendTagNumbers: (tagId: number, numbers: number[]) => void,
) => {
	const tagCount = bytes.readUint16LE(BYTE_OFFSET_TAG_COUNT);

	for (let i = 0; i < tagCount; i++) {
		const index = BYTE_OFFSET_FIRST_TAG + i * BYTES_PER_TAG;

		if (index + BYTES_PER_TAG >= bytes.length) continue;

		const tagId = bytes.readUInt16LE(index);
		const tagType = bytes.readUInt16LE(index + BYTE_OFFSET_TAG_TYPE);
		const tagValueSize = bytes.readUInt16LE(index + BYTE_OFFSET_TAG_SIZE);

		const sendNumbersForDataType = (
			parseNumberAtOffset: (offset: number) => number,
			sizeInBytes: number,
		) => {
			let values: number[];
			if (tagValueSize * sizeInBytes <= BYTES_PER_TAG_VALUE) {
				// Values fit inside the tag block itself
				values = Array.from({ length: tagValueSize }, (_, j) =>
					parseNumberAtOffset(index + BYTE_OFFSET_TAG_VALUE + j * sizeInBytes),
				);
			} else {
				// Values are stored outside the tag block; tag value is an offset
				const offset = bytes.readUint16LE(index + BYTE_OFFSET_TAG_VALUE);
				values = Array.from({ length: tagValueSize }, (_, j) =>
					parseNumberAtOffset(offset + j * sizeInBytes),
				);
			}
			sendTagNumbers(tagId, values);
		};

		switch (tagType) {
			case 1: // Int8
				sendNumbersForDataType((o) => bytes.readInt8(o), 1);
				break;
			case 3: // UInt16
				sendNumbersForDataType((o) => bytes.readUInt16LE(o), 2);
				break;
			case 4: // UInt32
				sendNumbersForDataType((o) => bytes.readUInt32LE(o), 4);
				break;
			case 9: // Int32
				sendNumbersForDataType((o) => bytes.readInt32LE(o), 4);
				break;
		}
	}
};
