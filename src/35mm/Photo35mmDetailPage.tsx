import Image from "next/image";
import Link from "next/link";

import Photo35mmDetailEnhancements from "@/35mm/Photo35mmDetailEnhancements";
import type { FilmPhoto } from "@/35mm/query";
import { getOptimizedUrl } from "@/storage/utils";

export default function Photo35mmDetailPage({
	photo,
	prevPhoto,
	nextPhoto,
	nextPhotos,
}: {
	photo: FilmPhoto;
	prevPhoto: FilmPhoto | null;
	nextPhoto: FilmPhoto | null;
	nextPhotos: FilmPhoto[];
}) {
	return (
		<div className="space-y-6 md:space-y-8">
			<Photo35mmDetailEnhancements
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
							href={`/35mm/${prevPhoto.id}`}
							prefetch
							className="hover:text-gray-900 transition-colors"
						>
							prev
						</Link>
					) : (
						<span className="opacity-40">prev</span>
					)}

					<Link
						href="/35mm"
						prefetch
						className="hover:text-gray-900 transition-colors"
					>
						back to 35mm
					</Link>

					{nextPhoto ? (
						<Link
							href={`/35mm/${nextPhoto.id}`}
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

			<div className="px-4 md:px-6 lg:px-8">
				<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
					<div className="overflow-hidden rounded-md bg-[#ebe7df]">
						<Image
							src={getOptimizedUrl(photo.url, "lg")}
							alt={photo.title || photo.id}
							width={photo.width}
							height={photo.height}
							priority
							className="h-auto w-full object-contain"
							sizes="(max-width: 1024px) 100vw, calc(100vw - 360px)"
						/>
					</div>

					<aside
						className="space-y-3 text-sm text-gray-600"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						<h1
							className="text-2xl text-[#18170f] leading-tight"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							{photo.title || "Untitled"}
						</h1>
						{photo.film && <p className="uppercase">{photo.film}</p>}
						{photo.description && (
							<p className="text-gray-700">{photo.description}</p>
						)}
					</aside>
				</div>
			</div>

			{nextPhotos.length > 0 && (
				<section className="px-4 pb-4 md:px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
						{nextPhotos.map((item) => (
							<Link
								key={item.id}
								href={`/35mm/${item.id}`}
								className="relative overflow-hidden bg-[#ebe7df]"
								style={{ aspectRatio: "1 / 1" }}
							>
								<Image
									src={getOptimizedUrl(item.url, "md")}
									alt={item.title || item.id}
									fill
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
									className="object-cover"
								/>
							</Link>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
