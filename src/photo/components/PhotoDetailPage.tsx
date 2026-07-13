import Link from "next/link";

import ImageSquare from "@/components/images/ImageSquare";
import PhotoDetail from "@/components/images/PhotoDetail";
import type { Photo } from "@/photo";
import PhotoDetailEnhancements from "@/photo/components/PhotoDetailEnhancements";
import PhotoDetailNavLink from "@/photo/components/PhotoDetailNavLink";
import PhotoDetailTransition from "@/photo/components/PhotoDetailTransition";
import { getOptimizedUrl } from "@/storage/utils";

export default function PhotoDetailPage({
	photo,
	prevPhoto,
	nextPhoto,
	nextPhotos,
	photoPathBase = "/p",
	backHref = "/",
	backLabel = "back to feed",
}: {
	photo: Photo;
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
	photoPathBase?: string;
	backHref?: string;
	backLabel?: string;
}) {
	const prevHref = prevPhoto ? `${photoPathBase}/${prevPhoto.id}` : null;
	const nextHref = nextPhoto ? `${photoPathBase}/${nextPhoto.id}` : null;

	return (
		<div className="space-y-6 md:space-y-8">
			<PhotoDetailEnhancements
				prevPhoto={prevPhoto}
				nextPhoto={nextPhoto}
				nextPhotos={nextPhotos}
				prevHref={prevHref}
				nextHref={nextHref}
			/>
			<div className="px-4 pt-8 md:px-6 lg:px-8">
				<div
					className="flex items-center justify-between border-b border-[#e5e0d9] pb-3 text-sm tracking-wide text-gray-600"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					{prevPhoto ? (
						<PhotoDetailNavLink
							href={prevHref ?? "#"}
							direction="prev"
							imageUrl={getOptimizedUrl(prevPhoto.url, "lg")}
						>
							prev
						</PhotoDetailNavLink>
					) : (
						<span className="opacity-40">prev</span>
					)}

					<Link
						href={backHref}
						prefetch
						className="hover:text-gray-900 transition-colors"
					>
						{backLabel}
					</Link>

					{nextPhoto ? (
						<PhotoDetailNavLink
							href={nextHref ?? "#"}
							direction="next"
							imageUrl={getOptimizedUrl(nextPhoto.url, "lg")}
						>
							next
						</PhotoDetailNavLink>
					) : (
						<span className="opacity-40">next</span>
					)}
				</div>
			</div>

			<PhotoDetailTransition>
				<PhotoDetail photo={photo} priority />
			</PhotoDetailTransition>

			{nextPhotos.length > 0 && (
				<section className="pb-4">
					<div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 pr-2">
						{nextPhotos.map((next, index) => (
							<ImageSquare
								key={next.id}
								photo={next}
								index={index}
								href={`${photoPathBase}/${next.id}`}
							/>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
