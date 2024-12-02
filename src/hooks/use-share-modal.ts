// hooks for share photo modal
import { create } from 'zustand';

interface ModalStore {
  isOpen: boolean;
  photoShareData?: PhotoShareData;
  onOpen: (photoShareData: PhotoShareData) => void;
  onClose: () => void;
}

interface PhotoShareData {
  socialText: string;
  photo: any;
}

export const useShareModal = create<ModalStore>((set) => ({
  isOpen: false,
  onOpen: (photoShareData) => set({ isOpen: true, photoShareData }),
  onClose: () => set({ isOpen: false }),
}));
