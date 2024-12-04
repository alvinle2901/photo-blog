import { createContext, useContext } from 'react';

import { AnimationConfig } from '@/components/AnimateItems';
import { User } from 'next-auth';

export interface AppStateContext {
  previousPathname?: string;
  hasLoaded?: boolean;
  setHasLoaded?: (hasLoaded: boolean) => void;
  userData?: User;
  setUserData?: (userData: User) => void;
  isUserLoggedIn?: boolean;
  setIsUserLoggedIn?: (isUserLoggedIn: boolean) => void;
  isCommandKOpen?: boolean;
  setIsCommandKOpen?: (isCommandKOpen: boolean) => void;
  nextPhotoAnimation?: AnimationConfig;
  setNextPhotoAnimation?: (animation?: AnimationConfig) => void;
  clearNextPhotoAnimation?: () => void;
}

export const AppStateContext = createContext<AppStateContext>({});

export const useAppState = () => useContext(AppStateContext);
