import { auth } from '@/lib/auth';

export const useGetUser = async () => {
  const session = await auth();
  const user = session?.user;

  return user;
};
