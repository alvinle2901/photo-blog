'use client';

import React from 'react';

import PhotoShareModal from '../modals/photoShareModal';

const PhotoShareModalProvider = () => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <PhotoShareModal />
    </>
  );
};

export default PhotoShareModalProvider;
