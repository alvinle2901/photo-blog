import { labelForFilm } from "@/film";
import PhotoFilmIcon from "@/film/PhotoFilmIcon";
import type { Photo } from "@/photo";

export default function FilmImageResponse({
	film,
	photos,
}: {
	film: string;
	photos: Photo[];
}) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				background: "#f7f5f2",
				color: "#111827",
				padding: 48,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 16,
					fontSize: 38,
					fontWeight: 700,
				}}
			>
				<PhotoFilmIcon film={film} height={28} />
				<span>{labelForFilm(film)}</span>
			</div>
			<div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>
				{photos.length} {photos.length === 1 ? "photo" : "photos"}
			</div>
		</div>
	);
}
