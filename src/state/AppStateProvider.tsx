'use client';

import { ReactNode, useEffect, useState } from 'react';

import { User } from 'next-auth';

import useSWR from 'swr';

import { AnimationConfig } from '@/components/AnimateItems';

import { getAuthAction } from '@/actions/auth';

import { AppStateContext } from '.';

export default function StateProvider({ children }: { children: ReactNode }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [userData, setUserData] = useState<User>();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  const [nextPhotoAnimation, setNextPhotoAnimation] = useState<AnimationConfig>();

  const { data } = useSWR('getAuth', getAuthAction);

  useEffect(() => {
    if (data) {
      setUserData?.(data?.user);
      setIsUserLoggedIn?.(true);
    }
  }, [data]);

  useEffect(() => {
    setHasLoaded?.(true);
  }, [setHasLoaded]);

  return (
    <AppStateContext.Provider
      value={{
        hasLoaded,
        setHasLoaded,
        userData,
        setUserData,
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
