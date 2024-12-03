'use client';

import { ReactNode, useEffect, useState } from 'react';

import { AnimationConfig } from '@/components/AnimateItems';

import { useGetUser } from '@/hooks/use-user';

import { AppStateContext } from '.';

export default function StateProvider({ children }: { children: ReactNode }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);

  const [nextPhotoAnimation, setNextPhotoAnimation] = useState<AnimationConfig>();

  const user = useGetUser();
  useEffect(() => {
    user.then((res) => {
      if (res) setIsUserLoggedIn?.(true);
    });
  }, [user]);

  useEffect(() => {
    setHasLoaded?.(true);
  }, [setHasLoaded]);

  return (
    <AppStateContext.Provider
      value={{
        hasLoaded,
        setHasLoaded,
        isUserLoggedIn,
        setIsUserLoggedIn,
        isCommandKOpen,
        setIsCommandKOpen,
        nextPhotoAnimation,
        setNextPhotoAnimation,
        clearNextPhotoAnimation: () => setNextPhotoAnimation?.(undefined),
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
