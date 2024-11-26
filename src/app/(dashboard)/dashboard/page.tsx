import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import ShuffleHero from '../_components/ShuffleHero';

export const metadata: Metadata = {
  title: 'Overview',
};

const page = async () => {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  return (
    <section className="space-y-4 p-4 pb-20">
      <ShuffleHero />
    </section>
  );
};

export default page;
