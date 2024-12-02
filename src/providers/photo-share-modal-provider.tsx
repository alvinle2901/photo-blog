'use client';

import React from 'react';

import PhotoShareModal from '../components/modals/photo-share-modal';

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
