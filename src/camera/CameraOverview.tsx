import Image from "next/image";
import Link from "next/link";

import { cameraLabel } from "@/camera";
import { Icons } from "@/components/icons";
import type { Photo } from "@/photo";
import OverviewHeader from "@/photo/components/OverviewHeader";
import { getOptimizedUrl } from "@/storage/utils";

export default function CameraOverview({
	make,
	model,
	photos,
	count,
}: {
	make: string;
	model: string;
	photos: Photo[];
	count: number;
}) {
	return (
		<section className="space-y-5 py-6">
			<OverviewHeader
				category="Shot on"
				title={cameraLabel(make, model)}
				count={count}
				icon={<Icons.camera size={14} strokeWidth={1.8} />}
			/>

			<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-1 sm:gap-2 pr-2">
				{photos.map((photo, index) => (
					<Link
						key={photo.id}
						href={`/shot-on/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${photo.id}`}
						prefetch={false}
						className="relative overflow-hidden bg-[#ebe7df]"
						style={{ aspectRatio: "1 / 1" }}
					>
						<Image
							src={getOptimizedUrl(photo.url, "md")}
							alt={photo.title || photo.id}
							fill
							sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
							className="object-cover"
							placeholder={photo.blurData ? "blur" : "empty"}
							blurDataURL={photo.blurData || undefined}
							priority={index < 8}
						/>
					</Link>
				))}
			</div>
		</section>
	);
}
