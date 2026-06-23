import Gallery35mm from "@/35mm/Gallery35mm";
import { getFilmPhotosCached } from "@/35mm/data";
import type { Metadata } from "next/types";
import { cache } from "react";

const getFilmPhotosCachedCached = cache(async () => getFilmPhotosCached());

export async function generateMetadata(): Promise<Metadata> {
  const filmPhotos = await getFilmPhotosCachedCached();
  const count = filmPhotos.length;
  const noun = count === 1 ? "photo" : "photos";
  const title = `35mm (${count} ${noun})`;
  const description = `${count} ${noun} from the 35mm collection.`;
  const images = filmPhotos[0]?.url ? [filmPhotos[0].url] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      url: "/35mm",
    },
    twitter: {
      title,
      description,
      images,
      card: "summary_large_image",
    },
  };
}

const Page35mm = async () => {
  const filmPhotos = await getFilmPhotosCachedCached();
  const galleryPhotos = filmPhotos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    width: photo.width,
    height: photo.height,
    title: photo.title,
  }));

  return (
    <div className="p-4 md:py-10 md:pr-12.5">
      <Gallery35mm filmPhotos={galleryPhotos} />
    </div>
  );
};

export default Page35mm;
