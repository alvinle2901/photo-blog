"use client";

import { useEffect, useState } from "react";
import { MapProvider } from "react-map-gl/mapbox";

import type { FilmPhoto } from "@/35mm/query";
import PhotoTabs from "@/admin/components/PhotoTabs";
import AdminMap from "@/components/map/AdminMap";
import type { Photo } from "@/photo";
import { fetchAllPhotos } from "@/photo/actions";

export default function AdminPhotoListPage() {
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [filmPhotos, setFilmPhotos] = useState<FilmPhoto[]>([]);
	const [isPending, setIsPending] = useState(true);

	useEffect(() => {
		Promise.all([
			fetchAllPhotos(),
			fetch("/api/photos/35mm")
				.then((r) => r.json() as Promise<FilmPhoto[]>)
				.catch(() => [] as FilmPhoto[]),
		])
			.then(([digitalPhotos, film]) => {
				setPhotos(digitalPhotos);
				setFilmPhotos(film);
			})
			.finally(() => setIsPending(false));
	}, []);

	return (
		<MapProvider>
			<div className="flex h-[calc(100vh-60px)] overflow-hidden">
				{/* Left content — scrolls independently */}
				<div className="w-full overflow-y-auto lg:w-7/12">
					<PhotoTabs
						photos={photos}
						filmPhotos={filmPhotos}
						isPending={isPending}
					/>
				</div>

				{/* Right Content — stays fixed */}
				<div className="hidden h-full w-full bg-muted lg:block lg:w-5/12">
					<AdminMap photos={photos} />
				</div>
			</div>
		</MapProvider>
	);
}
