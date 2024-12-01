import { InferResponseType } from 'hono';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.photos_35mm)[':id']['$delete']>;

export const useDelete35mmPhoto = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.photos_35mm[':id']['$delete']({ param: { id } });

      return await res.json();
    },
    onSuccess: () => {
      toast.success('Photo deleted');
      queryClient.invalidateQueries({
        queryKey: ['photo_35mm', { id }],
      });
      queryClient.invalidateQueries({
        queryKey: ['photos_35mm'],
      });
    },
    onError: () => {
      toast.error('Error deleting photo');
    },
  });

  return mutation;
};
