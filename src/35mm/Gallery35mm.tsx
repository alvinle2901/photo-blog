'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/columns.css';
import type { Photo } from 'react-photo-album';

import renderNextImage from '@/components/images/render-next-image';

export type Gallery35mmPhoto = {
	id: string;
	url: string;
	width: number;
	height: number;
	title: string | null;
};

type GalleryPhoto = Photo & {
	key: string;
};

type Props = {
	filmPhotos: Gallery35mmPhoto[];
};

const Gallery35mm = ({ filmPhotos }: Props) => {
	const router = useRouter();

	const photos = useMemo<GalleryPhoto[]>(
		() =>
			filmPhotos.map((photo) => ({
				key: photo.id,
				src: photo.url,
				width: photo.width,
				height: photo.height,
				alt: photo.title ?? '35mm photo',
			})),
		[filmPhotos],
	);

	return (
		<ColumnsPhotoAlbum
			photos={photos}
			render={{ image: renderNextImage }}
			defaultContainerWidth={1200}
			spacing={6}
			columns={(containerWidth) => (containerWidth < 768 ? 1 : 3)}
			sizes={{
				size: '1168px',
				sizes: [{ viewport: '(max-width: 1200px)', size: 'calc(100vw - 32px)' }],
			}}
			onClick={({ photo }) => {
				router.push(`/35mm/${String(photo.key)}`);
			}}
		/>
	);
};

export default Gallery35mm;
