import Image from "next/image";
import Link from "next/link";

import { labelForFilm } from "@/film";
import PhotoFilmIcon from "@/film/PhotoFilmIcon";
import type { Photo } from "@/photo";
import OverviewHeader from "@/photo/components/OverviewHeader";
import { getOptimizedUrl } from "@/storage/utils";

export default function FilmOverview({
	film,
	photos,
	count,
}: {
	film: string;
	photos: Photo[];
	count: number;
}) {
	return (
		<section className="space-y-5 py-6">
			<OverviewHeader
				category="Film"
				title={labelForFilm(film)}
				count={count}
				icon={
					<PhotoFilmIcon film={film} className="text-[#3d3a35]" height={14} />
				}
			/>

			<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-1 sm:gap-2 pr-2">
				{photos.map((photo, index) => (
					<Link
						key={photo.id}
						href={`/film/${encodeURIComponent(film)}/${photo.id}`}
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
							priority={index < 4}
						/>
					</Link>
				))}
			</div>
		</section>
	);
}
