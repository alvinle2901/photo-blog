"use client";

import { useCallback, useRef, useState } from "react";

import { Icons } from "@/components/icons";
import type { Photo } from "@/photo";

type UploadStatus =
	| { state: "idle" }
	| { state: "uploading"; fileName: string; progress: number }
	| { state: "success"; photo: Photo }
	| { state: "error"; message: string };

export function UploadDropzone() {
	const [status, setStatus] = useState<UploadStatus>({ state: "idle" });
	const [isDragOver, setIsDragOver] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const uploadFile = useCallback(async (file: File) => {
		if (!file.type.startsWith("image/")) {
			setStatus({ state: "error", message: "Only image files are supported." });
			return;
		}

		setStatus({ state: "uploading", fileName: file.name, progress: 0 });

		const formData = new FormData();
		formData.append("file", file);

		const res = await fetch("/api/upload", { method: "POST", body: formData });

		if (!res.ok) {
			const { error } = await res
				.json()
				.catch(() => ({ error: "Upload failed" }));
			setStatus({ state: "error", message: error ?? "Upload failed" });
			return;
		}

		const photo: Photo = await res.json();
		setStatus({ state: "success", photo });
	}, []);

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files?.length) return;
			uploadFile(files[0]);
		},
		[uploadFile],
	);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);
			handleFiles(e.dataTransfer.files);
		},
		[handleFiles],
	);

	const openFilePicker = () => inputRef.current?.click();

	return (
		<div className="rounded-sm border border-[#e5e0d9] bg-[#f7f5f2] p-4 shadow-sm">
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
					"flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed p-8 text-center transition",
					isDragOver
						? "border-[#18170f] bg-[#ebe7df]"
						: "border-[#d8d1c7] bg-[#ebe7df]/60 hover:border-[#9a7656] hover:bg-[#ebe7df]",
				].join(" ")}
			>
				<div className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] text-[#6f675d]">
					<Icons.upload size={20} />
				</div>
				<p
					className="mt-5 text-3xl font-light italic leading-none text-[#18170f]"
					style={{ fontFamily: "'Cormorant', serif" }}
				>
					Drop a digital photo
				</p>
				<p className="mt-2 max-w-sm text-sm leading-6 text-[#6f675d]">
					Click to browse or drag a file here. EXIF, blur placeholder, color
					palette, and optimized variants are extracted automatically.
				</p>
				<p
					className="mt-5 text-[10px] uppercase tracking-[0.16em] text-[#8c857a]"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					JPEG / PNG / HEIC / TIFF / WebP
				</p>
			</button>

			{status.state === "uploading" && (
				<div className="mt-4 rounded-sm border border-[#d8d1c7] bg-[#ebe7df] p-3 text-sm text-[#6f675d]">
					<p className="flex items-center gap-2">
						<Icons.loader className="h-4 w-4 animate-spin" />
						Uploading <span className="font-medium">{status.fileName}</span>…
					</p>
					<p className="mt-1 text-xs text-[#8c857a]">
						Extracting EXIF, generating blur hash and color palette
					</p>
				</div>
			)}

			{status.state === "error" && (
				<div className="mt-4 flex items-center justify-between rounded-sm border border-[#d9b8aa] bg-[#fff7f3] p-3 text-sm text-[#9a4d35]">
					<span>{status.message}</span>
					<button
						type="button"
						onClick={() => setStatus({ state: "idle" })}
						className="text-xs uppercase tracking-[0.12em] text-[#6f675d] hover:text-[#18170f]"
					>
						Dismiss
					</button>
				</div>
			)}

			{status.state === "success" && (
				<div className="mt-4 flex items-center justify-between gap-4 rounded-sm border border-[#c8d0c3] bg-[#eef2eb] p-4">
					<div className="space-y-0.5">
						<p className="flex items-center gap-2 text-sm font-medium text-[#4d5c4f]">
							<Icons.check size={16} />
							Upload complete
						</p>
						<p className="text-xs text-[#6f675d]">
							{status.photo.make && status.photo.model
								? `${status.photo.make} ${status.photo.model}`
								: status.photo.id}
						</p>
					</div>
					<button
						type="button"
						onClick={() => setStatus({ state: "idle" })}
						className="shrink-0 text-xs uppercase tracking-[0.12em] text-[#6f675d] hover:text-[#18170f]"
					>
						Upload another
					</button>
				</div>
			)}
		</div>
	);
}
