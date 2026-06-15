"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import type { Photo } from "@/photo";
import { updatePhoto } from "@/photo/actions";
import GeocoderControl from "./editMap/geocoder-control";
import EditMap from "./editMap/map";

type Props = {
	photo: Photo;
};

export function PhotoEditForm({ photo }: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [displayAspectRatio, setDisplayAspectRatio] = useState(
		photo.aspectRatio > 0 ? photo.aspectRatio : 4 / 3,
	);
	const [draftLocation, setDraftLocation] = useState(() => ({
		latitude: photo.latitude != null ? String(photo.latitude) : "",
		longitude: photo.longitude != null ? String(photo.longitude) : "",
		locationName: photo.locationName ?? "",
	}));

	const mapLocation = useMemo(() => {
		const parseCoordinate = (value: string) => {
			if (value.trim() === "") return null;
			const parsed = Number(value);
			return Number.isFinite(parsed) ? parsed : null;
		};

		return {
			latitude: parseCoordinate(draftLocation.latitude),
			longitude: parseCoordinate(draftLocation.longitude),
		};
	}, [draftLocation.latitude, draftLocation.longitude]);

	const handleLocationSelect = (location: {
		latitude: number;
		longitude: number;
		locationName?: string | null;
	}) => {
		setDraftLocation({
			latitude: String(location.latitude),
			longitude: String(location.longitude),
			locationName: location.locationName ?? "",
		});
	};

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setSaved(false);

		const fd = new FormData(e.currentTarget);

		const tagsRaw = (fd.get("tags") as string).trim();
		const tags = tagsRaw
			? tagsRaw
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: null;

		const priorityRaw = (fd.get("priorityOrder") as string).trim();
		const priorityOrder = priorityRaw ? parseFloat(priorityRaw) : null;

		const latRaw = (fd.get("latitude") as string).trim();
		const lngRaw = (fd.get("longitude") as string).trim();
		const latitude = latRaw ? parseFloat(latRaw) : null;
		const longitude = lngRaw ? parseFloat(lngRaw) : null;

		const recipeRaw = (fd.get("recipeData") as string).trim();
		let recipeData: unknown | null = null;
		if (recipeRaw) {
			try {
				recipeData = JSON.parse(recipeRaw);
			} catch {
				setError("Recipe data is not valid JSON.");
				return;
			}
		}

		startTransition(async () => {
			try {
				await updatePhoto(photo.id, {
					title: (fd.get("title") as string).trim() || null,
					caption: (fd.get("caption") as string).trim() || null,
					semanticDescription:
						(fd.get("semanticDescription") as string).trim() || null,
					tags,
					hidden: fd.get("hidden") === "on",
					priorityOrder: isNaN(priorityOrder!) ? null : priorityOrder,
					latitude: latitude != null && !isNaN(latitude) ? latitude : null,
					longitude: longitude != null && !isNaN(longitude) ? longitude : null,
					locationName: (fd.get("locationName") as string).trim() || null,
					recipeTitle: (fd.get("recipeTitle") as string).trim() || null,
					recipeData,
				});
				setSaved(true);
				router.refresh();
			} catch {
				setError("Failed to save changes. Please try again.");
			}
		});
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
				{/* Left column: Metadata, Recipe, Visibility */}
				<div className="space-y-6">
					<div
						className={displayAspectRatio < 1 ? "max-w-full" : ""}
						style={displayAspectRatio < 1 ? { width: "24rem" } : undefined}
					>
						<AspectRatio ratio={displayAspectRatio < 1 ? 3 / 4 : 4 / 3}>
							<Image
								src={photo.url}
								alt={photo.caption ?? photo.title ?? "Photo"}
								layout="fill"
								className="rounded-lg object-cover border"
								onLoadingComplete={(img) => {
									if (!img.naturalWidth || !img.naturalHeight) return;
									const nextAspectRatio = img.naturalWidth / img.naturalHeight;
									if (!Number.isFinite(nextAspectRatio)) return;
									if (Math.abs(nextAspectRatio - displayAspectRatio) < 0.01)
										return;
									setDisplayAspectRatio(nextAspectRatio);
								}}
							/>
						</AspectRatio>
					</div>
					{/* Metadata */}
					<section className="border rounded-lg p-5 space-y-4">
						<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							Metadata
						</h2>

						<Field label="Title">
							<input
								name="title"
								type="text"
								defaultValue={photo.title ?? ""}
								placeholder="e.g. Golden Hour, Misty Morning"
								className={inputCls}
							/>
						</Field>

						<Field label="Caption">
							<textarea
								name="caption"
								rows={3}
								defaultValue={photo.caption ?? ""}
								placeholder="Short caption shown below the photo"
								className={inputCls}
							/>
						</Field>

						<Field label="Description" hint="Used for search / AI context">
							<textarea
								name="semanticDescription"
								rows={3}
								defaultValue={photo.semanticDescription ?? ""}
								placeholder="Describe what's in the image"
								className={inputCls}
							/>
						</Field>

						<Field label="Tags" hint="Comma-separated">
							<input
								name="tags"
								type="text"
								defaultValue={photo.tags?.join(", ") ?? ""}
								placeholder="nature, travel, film"
								className={inputCls}
							/>
						</Field>
					</section>

					{/* Recipe */}
					<section className="border rounded-lg p-5 space-y-4">
						<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							Recipe
						</h2>

						<Field label="Recipe title">
							<input
								name="recipeTitle"
								type="text"
								defaultValue={photo.recipeTitle ?? ""}
								placeholder="e.g. Classic Chrome"
								className={inputCls}
							/>
						</Field>

						<Field label="Recipe data" hint="JSON">
							<textarea
								name="recipeData"
								rows={6}
								defaultValue={
									photo.recipeData
										? JSON.stringify(photo.recipeData, null, 2)
										: ""
								}
								placeholder='{"FilmSimulation": "Classic Chrome", ...}'
								className={`${inputCls} font-mono text-xs`}
								spellCheck={false}
							/>
						</Field>
					</section>
				</div>

				{/* Right column: Location, EXIF */}
				<div className="space-y-6">
					<div className="space-y-3">
						<div className="h-90 rounded-lg overflow-hidden border">
							<EditMap
								id={photo.id}
								latitude={mapLocation.latitude}
								longitude={mapLocation.longitude}
								locationName={draftLocation.locationName}
								onLocationSelect={handleLocationSelect}
							/>
						</div>

						{process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
							<div className="max-w-sm">
								<GeocoderControl
									mapboxAccessToken={
										process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
									}
									placeholder="Search location"
									minLength={2}
									limit={6}
									trackProximity
									onResult={(event) => {
										const result = event.result;
										const center = result?.center;

										if (!result || !center || center.length < 2) return;

										const [longitude, latitude] = center;
										handleLocationSelect({
											latitude,
											longitude,
											locationName: result.place_name ?? null,
										});
									}}
								/>
							</div>
						)}
					</div>

					{/* Location */}
					<section className="border rounded-lg p-5 space-y-4">
						<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							Location
						</h2>

						<Field label="Location name">
							<input
								name="locationName"
								type="text"
								value={draftLocation.locationName}
								onChange={(event) =>
									setDraftLocation((current) => ({
										...current,
										locationName: event.target.value,
									}))
								}
								placeholder="e.g. Tokyo, Japan"
								className={inputCls}
							/>
						</Field>

						<div className="grid grid-cols-2 gap-4">
							<Field label="Latitude">
								<input
									name="latitude"
									type="number"
									step="any"
									value={draftLocation.latitude}
									onChange={(event) =>
										setDraftLocation((current) => ({
											...current,
											latitude: event.target.value,
										}))
									}
									placeholder="e.g. 35.68950"
									className={inputCls}
								/>
							</Field>
							<Field label="Longitude">
								<input
									name="longitude"
									type="number"
									step="any"
									value={draftLocation.longitude}
									onChange={(event) =>
										setDraftLocation((current) => ({
											...current,
											longitude: event.target.value,
										}))
									}
									placeholder="e.g. 139.69171"
									className={inputCls}
								/>
							</Field>
						</div>
					</section>

					{/* EXIF (read-only) */}
					<section className="border rounded-lg p-5 space-y-3">
						<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							EXIF (read-only)
						</h2>

						<div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
							<ExifRow
								label="Camera"
								value={
									[photo.make, photo.model].filter(Boolean).join(" ") || null
								}
							/>
							<ExifRow
								label="Focal length"
								value={photo.focalLength ? `${photo.focalLength} mm` : null}
							/>
							<ExifRow
								label="35mm equiv."
								value={
									photo.focalLength35mm ? `${photo.focalLength35mm} mm` : null
								}
							/>
							<ExifRow
								label="Aperture"
								value={photo.fStop ? `f/${photo.fStop}` : null}
							/>
							<ExifRow
								label="Shutter"
								value={
									photo.exposureTime ? formatShutter(photo.exposureTime) : null
								}
							/>
							<ExifRow
								label="ISO"
								value={photo.iso ? String(photo.iso) : null}
							/>
							<ExifRow
								label="Exp. comp."
								value={
									photo.exposureComp != null
										? `${photo.exposureComp > 0 ? "+" : ""}${photo.exposureComp} EV`
										: null
								}
							/>
							<ExifRow label="Film sim." value={photo.filmSimulation} />
							<ExifRow
								label="Taken"
								value={
									photo.takenAt
										? photo.takenAt.toLocaleString()
										: (photo.takenAtNaive ?? null)
								}
							/>
						</div>
					</section>

					<Field
						label="Priority order"
						hint="Lower number = shown first; leave blank for default"
					>
						<input
							name="priorityOrder"
							type="number"
							step="any"
							defaultValue={photo.priorityOrder ?? ""}
							placeholder="e.g. 1"
							className={`${inputCls} max-w-[140px]`}
						/>
					</Field>

					{/* Visibility */}
					<section className="border rounded-lg p-5 space-y-4">
						<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							Visibility
						</h2>

						<label className="flex items-center gap-3 cursor-pointer">
							<input
								name="hidden"
								type="checkbox"
								defaultChecked={photo.hidden}
								className="w-4 h-4 rounded border-gray-300"
							/>
							<span className="text-sm text-gray-700">
								Hide from public gallery
							</span>
						</label>
					</section>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-4">
				<button
					type="submit"
					disabled={isPending}
					className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-black/80 disabled:opacity-40 transition-colors"
				>
					{isPending ? "Saving…" : "Save changes"}
				</button>

				<button
					type="button"
					onClick={() => router.back()}
					className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
				>
					Cancel
				</button>

				{saved && <span className="text-sm text-green-600">Saved!</span>}
				{error && <span className="text-sm text-red-600">{error}</span>}
			</div>
		</form>
	);
}

// ─── helpers ────────────────────────────────────────────────────────────────

const inputCls =
	"w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20";

function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1">
			<div className="flex items-baseline gap-2">
				<label className="text-sm font-medium text-gray-700">{label}</label>
				{hint && <span className="text-xs text-gray-400">{hint}</span>}
			</div>
			{children}
		</div>
	);
}

function ExifRow({
	label,
	value,
}: {
	label: string;
	value: string | null | undefined;
}) {
	return (
		<>
			<span className="text-gray-500">{label}</span>
			<span className={value ? "text-gray-900" : "text-gray-300"}>
				{value ?? "—"}
			</span>
		</>
	);
}

function formatShutter(sec: number): string {
	if (sec >= 1) return `${sec}s`;
	const denom = Math.round(1 / sec);
	return `1/${denom}s`;
}
