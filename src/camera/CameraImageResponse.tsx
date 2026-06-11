import type { Photo } from '@/photo';
import { cameraLabel } from '@/camera';

export default function CameraImageResponse({
  make,
  model,
  photos,
}: {
  make: string;
  model: string;
  photos: Photo[];
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f7f5f2',
        color: '#111827',
        padding: 48,
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 700 }}>{cameraLabel(make, model)}</div>
      <div style={{ display: 'flex', fontSize: 28, opacity: 0.9 }}>
        {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
      </div>
    </div>
  );
}
