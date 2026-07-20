import Link from "next/link";
import { notFound } from "next/navigation";

import { DeletePhotoButton } from "@/admin/components/DeletePhotoButton";
import { PhotoEditForm } from "@/admin/components/PhotoEditForm";
import { getPhotoById } from "@/photo/query";

export default async function PhotoEditPage({
	params,
}: {
	params: Promise<{ photoId: string }>;
}) {
	const { photoId } = await params;
	const photo = await getPhotoById(photoId);

	if (!photo) notFound();

	return (
		<div className="space-y-6 p-2 xl:p-8">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link
						href="/admin/photos"
						className="text-sm text-gray-500 transition-colors hover:text-black"
					>
						← Photos
					</Link>
					<span className="text-gray-300">/</span>
					<h1 className="text-2xl font-semibold">Edit photo</h1>
				</div>
				<DeletePhotoButton id={photo.id} redirectTo="/admin/photos" />
			</div>

			<p className="text-xs text-gray-400 font-mono">{photo.id}</p>

			<PhotoEditForm photo={photo} />
		</div>
	);
}
