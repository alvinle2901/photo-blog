"use client";

import { useCallback, useRef, useState } from "react";
import type { FilmPhoto } from "@/35mm/query";

type UploadStatus =
	| { state: "idle" }
	| { state: "uploading"; fileName: string }
	| { state: "success"; photo: FilmPhoto }
	| { state: "error"; message: string };

export function Upload35mmForm() {
	const [status, setStatus] = useState<UploadStatus>({ state: "idle" });
	const [isDragOver, setIsDragOver] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [film, setFilm] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = useCallback((file: File) => {
		if (!file.type.startsWith("image/")) {
			setStatus({ state: "error", message: "Only image files are supported." });
			return;
		}
		setSelectedFile(file);
		setStatus({ state: "idle" });
		const url = URL.createObjectURL(file);
		setPreview(url);
	}, []);

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files?.length) return;
			handleFileSelect(files[0]);
		},
		[handleFileSelect],
	);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);
			handleFiles(e.dataTransfer.files);
		},
		[handleFiles],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedFile) {
			setStatus({
				state: "error",
				message: "Please select a photo to upload.",
			});
			return;
		}

		setStatus({ state: "uploading", fileName: selectedFile.name });

		const formData = new FormData();
		formData.append("file", selectedFile);
		if (title.trim()) formData.append("title", title.trim());
		if (description.trim()) formData.append("description", description.trim());
		if (film.trim()) formData.append("film", film.trim());

		const res = await fetch("/api/upload/35mm", {
			method: "POST",
			body: formData,
		});

		if (!res.ok) {
			const { error } = await res
				.json()
				.catch(() => ({ error: "Upload failed" }));
			setStatus({ state: "error", message: error ?? "Upload failed" });
			return;
		}

		const photo: FilmPhoto = await res.json();
		setStatus({ state: "success", photo });
		// Reset form
		setSelectedFile(null);
		setPreview(null);
		setTitle("");
		setDescription("");
		setFilm("");
		if (inputRef.current) inputRef.current.value = "";
	};

	const reset = () => {
		setStatus({ state: "idle" });
		setSelectedFile(null);
		setPreview(null);
		setTitle("");
		setDescription("");
		setFilm("");
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Drop zone */}
			<div
				onDrop={onDrop}
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragOver(true);
				}}
				onDragLeave={() => setIsDragOver(false)}
				onClick={() => inputRef.current?.click()}
				className={[
					"border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden",
					isDragOver
						? "border-black bg-gray-50"
						: "border-gray-300 hover:border-gray-400",
					preview ? "p-0" : "p-12 text-center",
				].join(" ")}
			>
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => handleFiles(e.target.files)}
				/>
				{preview ? (
					// biome-ignore lint/a11y/useKeyWithClickEvents: wrapper handles click
					<div className="relative w-full" onClick={(e) => e.stopPropagation()}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={preview}
							alt="Preview"
							className="w-full max-h-80 object-contain bg-gray-100"
						/>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								reset();
							}}
							className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium shadow"
						>
							✕
						</button>
					</div>
				) : (
					<>
						<p className="text-sm text-gray-500">
							Drop a photo here, or{" "}
							<span className="text-black font-medium">click to browse</span>
						</p>
						<p className="text-xs text-gray-400 mt-1">
							JPEG, PNG, HEIC, TIFF, WebP
						</p>
					</>
				)}
			</div>

			{/* Metadata fields */}
			<div className="space-y-4">
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Title
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Golden Hour"
						className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
					/>
				</div>

				<div>
					<label
						htmlFor="film"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Film Stock
					</label>
					<input
						id="film"
						type="text"
						value={film}
						onChange={(e) => setFilm(e.target.value)}
						placeholder="e.g. Kodak Portra 400"
						className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
					/>
				</div>

				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Optional notes about this photo…"
						rows={3}
						className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
					/>
				</div>
			</div>

			{/* Status messages */}
			{status.state === "error" && (
				<p className="text-sm text-red-600">{status.message}</p>
			)}
			{status.state === "success" && (
				<div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
					Photo uploaded successfully
					{status.photo.title ? `: "${status.photo.title}"` : ""}.
				</div>
			)}

			{/* Submit */}
			<button
				type="submit"
				disabled={!selectedFile || status.state === "uploading"}
				className="w-full bg-black text-white text-sm font-medium py-2.5 rounded-md hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{status.state === "uploading" ? "Uploading…" : "Upload 35mm Photo"}
			</button>
		</form>
	);
}
