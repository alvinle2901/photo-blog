import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.photos_35mm)[':id']['$patch']>;

type RequestType = InferRequestType<(typeof client.api.photos_35mm)[':id']['$patch']>['json'];

export const useEdit35mmPhoto = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.photos_35mm[':id']['$patch']({
        param: { id },
        json,
      });

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Photo updated');
      queryClient.invalidateQueries({
        queryKey: ['photo_35mm', { id }],
      });
      queryClient.invalidateQueries({
        queryKey: ['photos_35mm'],
      });
    },
    onError: () => {
      toast.error('Failed to update photo');
    },
  });

  return mutation;
};
