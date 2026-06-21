import { Upload35mmForm } from "@/upload/components/Upload35mmForm";
import { UploadDropzone } from "@/upload/components/UploadDropzone";

export default function AdminUploadsPage() {
	return (
		<div className="space-y-10 max-w-xl">
			<section className="space-y-4">
				<div>
					<h1 className="text-2xl font-semibold">Upload</h1>
					<p className="text-sm text-gray-500 mt-1">
						EXIF metadata, blur placeholder, and color palette are extracted
						automatically.
					</p>
				</div>
				<UploadDropzone />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-xl font-semibold">35mm Upload</h2>
					<p className="text-sm text-gray-500 mt-1">
						Upload a scanned 35mm photo and fill in the metadata manually.
					</p>
				</div>
				<Upload35mmForm />
			</section>
		</div>
	);
}
