import Image from "next/image";
import Link from "next/link";

import type { Photo } from "@/photo";
import { getOptimizedUrl } from "@/storage/utils";

export default function YearOverview({
	year,
	photos,
	count,
}: {
	year: string;
	photos: Photo[];
	count: number;
}) {
	return (
		<section className="space-y-5 py-6">
			<header className="px-4 md:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold tracking-tight text-gray-900">
					{year}
				</h1>
				<p className="mt-1 text-sm text-gray-600">
					{count} {count === 1 ? "photo" : "photos"}
				</p>
			</header>

			<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2">
				{photos.map((photo, index) => (
					<Link
						key={photo.id}
						href={`/year/${encodeURIComponent(year)}/${photo.id}`}
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
