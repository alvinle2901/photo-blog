import { ImageResponse } from "next/og";

import { decodeCameraParams } from "@/camera";
import CameraImageResponse from "@/camera/CameraImageResponse";
import { getPhotosByCameraCached } from "@/photo/cache";

export async function GET(
	_: Request,
	context: { params: Promise<{ make: string; model: string }> },
) {
	const { make, model } = decodeCameraParams(await context.params);

	const photos = await getPhotosByCameraCached(make, model);

	const width = 1200;
	const height = 630;

	return new ImageResponse(
		<CameraImageResponse make={make} model={model} photos={photos} />,
		{
			width,
			height,
			headers: {
				"cache-control": "public, max-age=3600, s-maxage=3600",
			},
		},
	);
}
