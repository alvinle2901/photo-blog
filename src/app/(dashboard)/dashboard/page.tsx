import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import GeoMap from '../_components/Map';
import ShuffleGrid from '../_components/ShuffleGrid';
import { CityCountChart } from './city-count-chart';

export const metadata: Metadata = {
  title: 'Overview',
};

const page = async () => {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  return (
    <section className="space-y-4 p-4 pb-20">
      <div className="mx-auto grid h-full w-full grid-cols-1 items-center gap-8 overflow-x-hidden py-4 md:grid-cols-2 md:py-8 xl:grid-cols-11">
        <div className="xl:col-span-2">
          <CityCountChart />
        </div>
        <div className="xl:col-span-4">
          <ShuffleGrid />
        </div>
        <div className="h-[450px] overflow-hidden rounded-lg border shadow-sm xl:col-span-5 xl:h-full">
          <GeoMap />
        </div>
      </div>
    </section>
  );
};

export default page;
