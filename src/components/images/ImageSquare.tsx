import { Photo } from '@/photo';
import { getOptimizedUrl } from '@/storage/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function ImageSquare({
  photo,
  index
}: {
  photo: Photo;
  index: number;
}) {
  return (
    <Link
      key={photo.id}
      href={`/p/${photo.id}`}
      className="relative overflow-hidden bg-[#ebe7df]"
      style={{ aspectRatio: '1 / 1' }}>
      <Image
        src={getOptimizedUrl(photo.url, 'md')}
        alt={photo.title || photo.id}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        placeholder={photo.blurData ? 'blur' : 'empty'}
        blurDataURL={photo.blurData || undefined}
        priority={index < 8}
      />
    </Link>
  );
}
