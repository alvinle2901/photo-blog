import PhotoGallery from '@/app/(home)/_components/Gallery/PhotoGallery';

// meta
export const metadata = {
  title: 'Grid',
};

const GridPage = () => {
  return (
    <div className="p-4 md:py-[40px] md:pr-[50px] ml-0 md:ml-[320px]">
      <PhotoGallery />
    </div>
  );
};

export default GridPage;
