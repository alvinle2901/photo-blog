import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGet35mmPhotos = () => {
  const query = useQuery({
    queryKey: ['photos_35mm'],
    queryFn: async () => {
      const res = await client.api.photos_35mm.$get({
        query: {},
      });

      if (!res.ok) {
        throw new Error('Get photos wrong');
      }

      const { data } = await res.json();

      return data;
    },
  });

  return query;
};
