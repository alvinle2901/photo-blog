'use client';

import { useEffect } from 'react';

import { useGetUser } from '@/hooks/use-user';
import { useAppState } from '@/state';

import PhotoList from './_components/PhotoList';

const HomePage = () => {
  const { setIsUserLoggedIn } = useAppState();

  useEffect(() => {
    useGetUser().then((res) => {
      if (res) setIsUserLoggedIn?.(true);
    });
  }, []);

  return <PhotoList />;
};

export default HomePage;
