"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { MapProvider } from "react-map-gl/mapbox";

import { fetchAllFilmPhotos } from "@/35mm/actions";
import type { FilmPhoto } from "@/35mm/query";
import PhotoTabs from "@/admin/components/PhotoTabs";
import AdminMap from "@/components/map/AdminMap";
import type { Photo } from "@/photo";
import { fetchAllPhotos } from "@/photo/actions";

export default function AdminPhotoListPage() {
	const [mapKey, setMapKey] = useState(0);
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [filmPhotos, setFilmPhotos] = useState<FilmPhoto[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

	const handleDeletePhoto = (photoId: string) => {
		setPhotos((current) => current.filter((photo) => photo.id !== photoId));
		setSelectedPhotoId((current) => (current === photoId ? null : current));
	};

	const handleDeleteFilmPhoto = (photoId: string) => {
		setFilmPhotos((current) =>
			current.filter((photo) => photo.id !== photoId),
		);
	};

	useLayoutEffect(() => {
		return () => {
			setMapKey((current) => current + 1);
		};
	}, []);

	useEffect(() => {
		Promise.all([fetchAllPhotos(), fetchAllFilmPhotos().catch(() => [])])
			.then(([digitalPhotos, film]) => {
				setPhotos(digitalPhotos);
				setFilmPhotos(film);
			})
			.finally(() => setIsPending(false));
	}, []);

	return (
		<MapProvider key={mapKey}>
			<div className="flex h-[calc(100vh-64px)] overflow-hidden">
				<div className="w-full overflow-y-auto border-r border-[#e5e0d9] lg:w-7/12">
					<section className="border-b border-[#e5e0d9] px-5 py-6 sm:px-7">
						<p
							className="text-[11px] uppercase tracking-[0.18em] text-[#b5b0a8]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							library desk
						</p>
						<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h1
									className="text-4xl font-light italic leading-none text-[#18170f] sm:text-5xl"
									style={{ fontFamily: "'Cormorant', serif" }}
								>
									photos
								</h1>
								<p
									className="mt-2 text-xs uppercase tracking-[0.12em] text-[#8c857a]"
									style={{ fontFamily: "'DM Mono', monospace" }}
								>
									{photos.length} digital / {filmPhotos.length} 35mm
								</p>
							</div>
							<p className="max-w-[26rem] text-sm leading-6 text-[#6f675d]">
								Edit metadata, locate frames, and keep the archive tidy without
								leaving the contact sheet.
							</p>
						</div>
					</section>
					<PhotoTabs
						photos={photos}
						filmPhotos={filmPhotos}
						isPending={isPending}
						selectedPhotoId={selectedPhotoId}
						onSelectPhoto={setSelectedPhotoId}
						onDeletePhoto={handleDeletePhoto}
						onDeleteFilmPhoto={handleDeleteFilmPhoto}
					/>
				</div>

				<div className="hidden h-full w-full bg-[#ebe7df] p-3 lg:block lg:w-5/12">
					<div className="relative h-full overflow-hidden rounded-sm border border-[#d8d1c7] bg-[#ebe7df] shadow-[inset_0_0_0_1px_rgba(24,23,15,0.08)]">
						<div className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-[#d8d1c7] bg-[#f7f5f2] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#6f675d]">
							map index
						</div>
						<AdminMap photos={photos} />
					</div>
				</div>
			</div>
		</MapProvider>
	);
}
