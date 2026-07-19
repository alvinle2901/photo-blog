"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import type { FilmPhoto } from "@/35mm/query";
import { Icons } from "@/components/icons";

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

	const openFilePicker = () => inputRef.current?.click();

	return (
		<form
			onSubmit={handleSubmit}
			className="rounded-sm border border-[#e5e0d9] bg-[#f7f5f2] p-4 shadow-sm"
		>
			<div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
				<div className="relative">
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={(e) => handleFiles(e.target.files)}
					/>
					<button
						type="button"
						onDrop={onDrop}
						onDragOver={(e) => {
							e.preventDefault();
							setIsDragOver(true);
						}}
						onDragLeave={() => setIsDragOver(false)}
						onClick={openFilePicker}
						className={[
							"min-h-[420px] w-full cursor-pointer overflow-hidden rounded-sm border border-dashed transition",
							isDragOver
								? "border-[#18170f] bg-[#ebe7df]"
								: "border-[#d8d1c7] bg-[#ebe7df]/60 hover:border-[#9a7656] hover:bg-[#ebe7df]",
							preview
								? "p-0"
								: "flex items-center justify-center p-8 text-center",
						].join(" ")}
					>
						{preview ? (
							<div className="relative flex h-full min-h-[420px] w-full items-center justify-center bg-[#18170f]">
								<Image
									src={preview}
									alt="Selected 35mm scan preview"
									fill
									unoptimized
									sizes="(max-width: 1024px) 100vw, 620px"
									className="object-contain"
								/>
							</div>
						) : (
							<div className="max-w-sm">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] text-[#6f675d]">
									<Icons.photos size={20} />
								</div>
								<p
									className="mt-5 text-3xl font-light italic leading-none text-[#18170f]"
									style={{ fontFamily: "'Cormorant', serif" }}
								>
									Drop a 35mm scan
								</p>
								<p className="mt-2 text-sm leading-6 text-[#6f675d]">
									Use this for scanned film frames that need title, stock, and
									notes entered by hand.
								</p>
								<p
									className="mt-5 text-[10px] uppercase tracking-[0.16em] text-[#8c857a]"
									style={{ fontFamily: "'DM Mono', monospace" }}
								>
									JPEG / PNG / HEIC / TIFF / WebP
								</p>
							</div>
						)}
					</button>
					{preview && (
						<button
							type="button"
							onClick={reset}
							className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] text-[#6f675d] shadow-sm transition hover:text-[#18170f]"
							aria-label="Remove selected photo"
						>
							<Icons.x size={16} />
						</button>
					)}
				</div>

				<div className="flex flex-col rounded-sm border border-[#e5e0d9] bg-[#ebe7df] p-4">
					<div className="space-y-4">
						<div>
							<label
								htmlFor="title"
								className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#8c857a]"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								Title
							</label>
							<input
								id="title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Golden Hour"
								className="w-full rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#18170f] outline-none transition placeholder:text-[#b5b0a8] focus:border-[#18170f]"
							/>
						</div>

						<div>
							<label
								htmlFor="film"
								className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#8c857a]"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								Film stock
							</label>
							<input
								id="film"
								type="text"
								value={film}
								onChange={(e) => setFilm(e.target.value)}
								placeholder="Kodak Portra 400"
								className="w-full rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] px-3 py-2.5 text-sm text-[#18170f] outline-none transition placeholder:text-[#b5b0a8] focus:border-[#18170f]"
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#8c857a]"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								Description
							</label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Optional notes about this frame..."
								rows={7}
								className="w-full resize-none rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] px-3 py-2.5 text-sm leading-6 text-[#18170f] outline-none transition placeholder:text-[#b5b0a8] focus:border-[#18170f]"
							/>
						</div>
					</div>

					<div className="mt-auto space-y-3 pt-5">
						{status.state === "error" && (
							<div className="rounded-sm border border-[#d9b8aa] bg-[#fff7f3] p-3 text-sm text-[#9a4d35]">
								{status.message}
							</div>
						)}
						{status.state === "success" && (
							<div className="rounded-sm border border-[#c8d0c3] bg-[#eef2eb] p-3 text-sm text-[#4d5c4f]">
								Photo uploaded successfully
								{status.photo.title ? `: "${status.photo.title}"` : ""}.
							</div>
						)}

						<button
							type="submit"
							disabled={!selectedFile || status.state === "uploading"}
							className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#18170f] px-4 text-sm font-medium text-[#f7f5f2] transition hover:bg-[#2a281f] disabled:cursor-not-allowed disabled:opacity-45"
						>
							{status.state === "uploading" ? (
								<>
									<Icons.loader className="h-4 w-4 animate-spin" />
									Uploading {status.fileName}
								</>
							) : (
								<>
									<Icons.upload size={16} />
									Upload 35mm photo
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</form>
	);
}
