import { UploadDropzone } from '@/upload/components/UploadDropzone';

export default function AdminUploadsPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Upload</h1>
        <p className="text-sm text-gray-500 mt-1">
          EXIF metadata, blur placeholder, and color palette are extracted automatically.
        </p>
      </div>
      <UploadDropzone />
    </div>
  );
}
