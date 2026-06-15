"use client";

import { useTransition } from "react";
import { deletePhoto } from "@/photo/actions";

export function DeletePhotoButton({ id }: { id: string }) {
	const [isPending, startTransition] = useTransition();

	return (
		<button
			disabled={isPending}
			onClick={() => {
				if (!confirm("Delete this photo? This cannot be undone.")) return;
				startTransition(() => deletePhoto(id));
			}}
			className="text-xs text-red-600 hover:text-red-800 disabled:opacity-40 transition-colors"
		>
			{isPending ? "Deleting…" : "Delete"}
		</button>
	);
}
