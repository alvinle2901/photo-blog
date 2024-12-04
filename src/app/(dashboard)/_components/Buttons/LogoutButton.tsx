import { Icons } from '@/components/icons';
import { DropdownMenuItem, DropdownMenuShortcut } from '@/components/ui/DropdownMenu';

import { logout } from '@/actions/auth';

const LogoutButton = () => {
  return (
    <form
      action={async () => {
        logout();
      }}
    >
      <DropdownMenuItem>
        <button className="flex w-full items-center">
          <Icons.logout className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </button>
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </form>
  );
};

export default LogoutButton;
