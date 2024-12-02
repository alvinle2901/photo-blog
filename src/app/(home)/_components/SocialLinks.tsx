import { Facebook, Instagram } from 'react-feather';

const FACEBOOK_LINK = 'https://www.facebook.com/alvinle29';
const INSTAGRAM_LINK = 'https://www.instagram.com/shot_by_al_';

const SocialLinks = () => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <div className="flex space-x-4 text-gray-400">
        <a
          href={FACEBOOK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook account link"
          className="p-1"
        >
          <Facebook className="w-[18px] h-[18px] hover:text-black transition duration-500 transform hover:-translate-y-1" />
        </a>
        <a
          href={INSTAGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram account link"
          className="p-1"
        >
          <Instagram className="w-[18px] h-[18px] hover:text-black transition duration-500 transform hover:-translate-y-1" />
        </a>
      </div>
    </div>
  );
};

export default SocialLinks;
