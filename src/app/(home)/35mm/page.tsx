import Gallery35mm from '@/components/images/Gallery35mm';

export const metadata = {
  title: '35mm',
};

const Page35mm = () => {
  return (
    <div className="p-4 md:py-[40px] md:pr-[50px] ml-0 md:ml-[320px]">
      <Gallery35mm />
    </div>
  );
};

export default Page35mm;
