import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Photo35mm } from '@/app/(dashboard)/_components/photo-list';

interface Photos35mmStore {
  photos35mm: Photo35mm[];
  setPhotos35mm: (photos35mm: Photo35mm[]) => void;
}

export const use35mmPhotos = create<Photos35mmStore>()(
  // Save fetched 35mm photos to persist store
  persist(
    (set, get) => ({
      photos35mm: [],
      setPhotos35mm: (photoShareData) => set({ photos35mm: photoShareData }),
    }),
    {
      name: 'photos35mm-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
