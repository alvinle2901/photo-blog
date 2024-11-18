'use client';

import { CityCountChart } from '../dashboard/city-count-chart';
import ShuffleGrid from './ShuffleGrid';
import GeoMap from './geoMap';

const ShuffleHero = () => {
  return (
    <section className="mx-auto grid h-full w-full grid-cols-1 items-center gap-8 overflow-x-hidden py-4 md:grid-cols-2 md:py-8 xl:grid-cols-11">
      <div className="xl:col-span-2">
        <CityCountChart />
      </div>
      <div className="xl:col-span-4">
        <ShuffleGrid />
      </div>
      <div className="h-[450px] overflow-hidden rounded-lg border shadow-sm xl:col-span-5 xl:h-full">
        <GeoMap />
      </div>
    </section>
  );
};

export default ShuffleHero;
