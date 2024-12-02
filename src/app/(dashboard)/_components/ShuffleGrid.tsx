'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';

import { motion } from 'framer-motion';

import { Icons } from '@/components/icons';

import { useGetPhotos } from '@/features/photos/api/use-get-photos';

import { Photo } from './PhotoList';

const shuffle = (array: Photo[]) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

const generateSquares = (squareData: Photo[]) => {
  return shuffle(squareData).map((sq: Photo) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: 'spring' }}
      className="h-full w-full overflow-hidden"
    >
      <Image
        src={sq.url}
        alt={sq.title}
        width={256}
        height={256}
        placeholder="blur"
        blurDataURL={sq.blurData}
        className="h-full w-full object-cover"
      />
    </motion.div>
  ));
};

const ShuffleGrid = () => {
  const photosQuery = useGetPhotos();
  const squareData = useMemo(() => {
    if (!photosQuery.data || photosQuery.data.length === 0) return [];
    return photosQuery.data?.length <= 16 ? photosQuery.data : photosQuery.data?.slice(0, 16);
  }, [photosQuery.data]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [squares, setSquares] = useState(generateSquares(squareData));

  useEffect(() => {
    const shuffleSquares = () => {
      setSquares(generateSquares(squareData));

      timeoutRef.current = setTimeout(shuffleSquares, 3000);
    };

    shuffleSquares();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [squareData]);

  return photosQuery.isPending ? (
    <div className="flex h-[450px] w-full items-center justify-center">
      <Icons.loader className="animate-spin" />
    </div>
  ) : (
    <div className="grid h-[450px] grid-cols-4 grid-rows-4 gap-1">{squares.map((sq) => sq)}</div>
  );
};

export default ShuffleGrid;
