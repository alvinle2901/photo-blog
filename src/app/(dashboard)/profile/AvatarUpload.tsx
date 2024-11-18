import Image from 'next/image';

import { Icons } from '@/components/icons';
import { UploadButton } from '@/lib/uploadthing';

interface AvatarUploadProps {
  onChange: (url?: string) => void;
  value?: string;
}

const AvatarUpload = ({ value, onChange }: AvatarUploadProps) => {
  if (value) {
    return (
      <div className="relative h-20 w-20">
        <Image src={value} fill alt="upload" className="rounded-full" />
        <button
          onClick={() => onChange('')}
          type="button"
          className="absolute right-0 top-0 rounded-full bg-rose-500 p-1 text-white shadow-sm"
        >
          <Icons.x className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        // Do something with the error.
        console.log(`ERROR! ${error.message}`);
      }}
    />
  );
};

export default AvatarUpload;
