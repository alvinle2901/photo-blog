'use server';

import { signOut } from '@/lib/auth';

export const useLogout = async () => {
  await signOut({
    redirectTo: '/auth/login',
  });
};
