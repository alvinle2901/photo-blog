import Link from "next/link";

import ImageSquare from "@/components/images/ImageSquare";
import PhotoDetail from "@/components/images/PhotoDetail";
import type { Photo } from "@/photo";
import PhotoDetailEnhancements from "@/photo/components/PhotoDetailEnhancements";

export default function PhotoDetailPage({
	photo,
	prevPhoto,
	nextPhoto,
	nextPhotos,
	photoPathBase = "/p",
}: {
	photo: Photo;
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
	photoPathBase?: string;
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
						<Link
							href={prevHref ?? "#"}
							prefetch
							className="hover:text-gray-900 transition-colors"
						>
							prev
						</Link>
					) : (
						<span className="opacity-40">prev</span>
					)}

					<Link
						href="/"
						prefetch
						className="hover:text-gray-900 transition-colors"
					>
						back to feed
					</Link>

					{nextPhoto ? (
						<Link
							href={nextHref ?? "#"}
							prefetch
							className="hover:text-gray-900 transition-colors"
						>
							next
						</Link>
					) : (
						<span className="opacity-40">next</span>
					)}
				</div>
			</div>

			<PhotoDetail photo={photo} priority />

			{nextPhotos.length > 0 && (
				<section className="pb-4">
					<div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
						{nextPhotos.map((next, index) => (
							<ImageSquare key={next.id} photo={next} index={index} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
