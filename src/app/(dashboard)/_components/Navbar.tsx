import { Separator } from '@/components/ui/Separator';

import HomeButton from './home-button';
import Navigation from './navigation';
import UploadButton from './upload-button';
import UserButton from './user-button';

const Navbar = () => {
  return (
    <header
      style={{
        backgroundColor: 'transparent',
        backgroundImage: 'radial-gradient(transparent 1px, #ffffff 1px)',
        backgroundSize: '4px 4px',
        backdropFilter: 'saturate(50%) blur(4px)',
      }}
      className="sticky top-0 z-50 border-b"
    >
      <div className="flex h-[60px] items-center px-4">
        <div className="flex items-center gap-x-8">
          <Navigation />
        </div>
        <div className="ml-auto flex items-center space-x-2 md:space-x-3">
          <HomeButton />
          <UploadButton />
          <Separator orientation="vertical" className="h-5" />
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
