import Image from "next/image";
import Link from "next/link";
import { DeletePhotoButton } from "@/admin/components/DeletePhotoButton";
import { getPhotos } from "@/photo/query";

export default async function AdminPhotosPage() {
	const photos = await getPhotos();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Photos ({photos.length})</h1>
				<Link
					href="/admin/uploads"
					className="text-sm px-3 py-1.5 bg-black text-white rounded-md hover:bg-black/80 transition-colors"
				>
					Upload
				</Link>
			</div>

			{photos.length === 0 ? (
				<div className="text-center py-16 text-sm text-gray-500">
					No photos yet.{" "}
					<Link href="/admin/uploads" className="text-black underline">
						Upload one
					</Link>
				</div>
			) : (
				<div className="border rounded-lg overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 border-b">
							<tr>
								<th className="text-left p-3 font-medium text-gray-600 w-16" />
								<th className="text-left p-3 font-medium text-gray-600">
									Photo
								</th>
								<th className="text-left p-3 font-medium text-gray-600 hidden md:table-cell">
									Camera
								</th>
								<th className="text-left p-3 font-medium text-gray-600 hidden lg:table-cell">
									Taken
								</th>
								<th className="text-right p-3 font-medium text-gray-600">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{photos.map((photo) => (
								<tr
									key={photo.id}
									className="hover:bg-gray-50 transition-colors"
								>
									<td className="p-3">
										{photo.blurData && (
											<div className="relative w-12 h-9 rounded overflow-hidden bg-gray-100">
												<Image
													src={photo.url}
													alt=""
													fill
													className="object-cover"
													sizes="48px"
												/>
											</div>
										)}
									</td>
									<td className="p-3">
										<div className="font-medium text-xs text-gray-400 font-mono truncate max-w-[180px]">
											{photo.id}
										</div>
										{photo.title && (
											<div className="text-sm mt-0.5">{photo.title}</div>
										)}
									</td>
									<td className="p-3 hidden md:table-cell text-gray-600">
										{photo.make && photo.model ? (
											`${photo.make} ${photo.model}`
										) : (
											<span className="text-gray-300">—</span>
										)}
									</td>
									<td className="p-3 hidden lg:table-cell text-gray-600">
										{photo.takenAt ? (
											photo.takenAt.toLocaleDateString()
										) : (
											<span className="text-gray-300">—</span>
										)}
									</td>
									<td className="p-3 text-right space-x-3">
										<Link
											href={`/admin/photos/${photo.id}/edit`}
											className="text-xs text-gray-600 hover:text-black transition-colors"
										>
											Edit
										</Link>
										<DeletePhotoButton id={photo.id} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
