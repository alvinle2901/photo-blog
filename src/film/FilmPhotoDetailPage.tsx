import Image from "next/image";
import Link from "next/link";
import PhotoDetail from "@/components/images/PhotoDetail";
import type { Photo } from "@/photo";
import PhotoDetailEnhancements from "@/photo/components/PhotoDetailEnhancements";
import { getOptimizedUrl } from "@/storage/utils";

export default function FilmPhotoDetailPage({
	film,
	photo,
	prevPhoto,
	nextPhoto,
	nextPhotos,
}: {
	film: string;
	photo: Photo;
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
}) {
	const filmPath = `/film/${encodeURIComponent(film)}`;

	return (
		<div className="space-y-6 md:space-y-8">
			<PhotoDetailEnhancements
				prevPhoto={prevPhoto}
				nextPhoto={nextPhoto}
				nextPhotos={nextPhotos}
			/>

			<div className="px-4 pt-8 md:px-6 lg:px-8">
				<div
					className="flex items-center justify-between border-b border-[#e5e0d9] pb-3 text-sm tracking-wide text-gray-600"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					{prevPhoto ? (
						<Link
							href={`${filmPath}/${prevPhoto.id}`}
							prefetch
							className="hover:text-gray-900 transition-colors"
						>
							prev
						</Link>
					) : (
						<span className="opacity-40">prev</span>
					)}

					<Link
						href={filmPath}
						prefetch
						className="hover:text-gray-900 transition-colors"
					>
						back to film
					</Link>

					{nextPhoto ? (
						<Link
							href={`${filmPath}/${nextPhoto.id}`}
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
						{nextPhotos.map((item, index) => (
							<Link
								key={item.id}
								href={`${filmPath}/${item.id}`}
								className="relative overflow-hidden bg-[#ebe7df]"
								style={{ aspectRatio: "1 / 1" }}
							>
								<Image
									src={getOptimizedUrl(item.url, "md")}
									alt={item.title || item.id}
									fill
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
									className="object-cover"
									placeholder={item.blurData ? "blur" : "empty"}
									blurDataURL={item.blurData || undefined}
									priority={index < 8}
								/>
							</Link>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
