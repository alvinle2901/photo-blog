'use server';

import { auth, signOut } from '@/lib/auth';

export const useGetUser = async () => {
  const session = await auth();
  const user = session?.user;

  return user;
};

export const useLogout = async () => {
  'use server';
  await signOut({
    redirectTo: '/auth/login',
  });
};
