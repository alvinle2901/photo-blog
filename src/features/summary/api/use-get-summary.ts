import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetSummary = () => {
  const query = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const res = await client.api.summary.$get();

      if (!res.ok) {
        throw new Error('Failed to fetch summary');
      }

      const { data } = await res.json();

      return data;
    },
  });

  return query;
};
