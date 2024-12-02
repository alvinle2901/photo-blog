// image render for react-photo-album lib
import { RenderImageContext, RenderImageProps } from 'react-photo-album';

import Image from 'next/image';

export default function renderNextImage(
  { alt = '', title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext,
) {
  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        fill
        src={photo}
        alt={alt}
        title={title}
        sizes={sizes}
        placeholder={'blurDataURL' in photo ? 'blur' : undefined}
      />
    </div>
  );
}
