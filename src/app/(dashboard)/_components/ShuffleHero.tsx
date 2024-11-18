'use client';

import ShuffleGrid from './ShuffleGrid';
import { CityCountChart } from '../dashboard/city-count-chart';
import GeoMap from './geoMap';

const ShuffleHero = () => {
  return (
    <section className="w-full h-full py-4 md:py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-11 items-center gap-8 mx-auto overflow-x-hidden">
      <div className="xl:col-span-2">
        <CityCountChart />
      </div>
      <div className="xl:col-span-4">
        <ShuffleGrid />
      </div>
      <div className="xl:col-span-5 rounded-lg shadow-sm h-[450px] xl:h-full overflow-hidden border">
        <GeoMap />
      </div>
    </section>
  );
};

export default ShuffleHero;
