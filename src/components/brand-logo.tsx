import Image from 'next/image';

import { cn } from '@/utils/cn';

import APPLE from '/public/Apple.svg';
import CANON from '/public/canon.svg';
import DJI from '/public/dji.svg';
import FUJIFILM from '/public/fujifilm.svg';
import HASSELBLAD from '/public/hasselblad.svg';
import LEICA from '/public/leica.svg';
import NIKON from '/public/nikon.svg';
import OLYMPUS from '/public/olympus.svg';
import PANASONIC from '/public/panasonic.svg';
import SONY from '/public/sony.svg';

interface Props {
  brandName: string | null;
  small: boolean;
}

const brandLogos: { [key: string]: any } = {
  dji: DJI,
  sony: SONY,
  canon: CANON,
  nikon: NIKON,
  fujifilm: FUJIFILM,
  panasonic: PANASONIC,
  leica: LEICA,
  hasselblad: HASSELBLAD,
  olympus: OLYMPUS,
  apple: APPLE,
};

const BrandLogo = ({ brandName, small }: Props) => {
  if (!brandName) return <div>-</div>;
  const normalizedBrandName = brandName.toLowerCase();
  const logoSrc = brandLogos[normalizedBrandName];

  if (!logoSrc) {
    return <div>-</div>;
  }

  return (
    <Image
      src={logoSrc}
      alt={`${normalizedBrandName} logo`}
      width={40}
      height={40}
      className={cn(
        'h-[25px] lg:h-[40px] w-auto object-contain',
        small && 'h-[20px] lg:h-[30px] w-auto',
      )}
    />
  );
};

export default BrandLogo;
