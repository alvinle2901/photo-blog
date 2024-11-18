'use client';

import { MapProvider } from 'react-map-gl';

import Mapbox from '../../../components/map';
import FilterBar from '../_components/filter';
import PhotoList from '../_components/photo-list';

const page = () => {
  return (
    <MapProvider>
      <div className="flex">
        {/* Left content */}
        <div className="w-full lg:w-7/12">
          {/* Filter */}
          <div className="flex h-[68px] items-center border-b px-4">
            <FilterBar />
          </div>

          <PhotoList />
        </div>

        {/* Right Content */}
        <div className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-full bg-muted lg:block lg:w-5/12">
          <Mapbox />
        </div>
      </div>
    </MapProvider>
  );
};

export default page;
