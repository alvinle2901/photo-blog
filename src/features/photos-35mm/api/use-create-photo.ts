import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.photos_35mm.$post>;
type RequestType = InferRequestType<typeof client.api.photos_35mm.$post>['json'];

export const useCreate35mmPhoto = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.photos_35mm.$post({ json });

      return await res.json();
    },
    onSuccess: () => {
      toast.success('Photo created');
      queryClient.invalidateQueries({
        queryKey: ['photos_35mm'],
      });
    },
    onError: () => {
      toast.error('Failed to create photo');
    },
  });

  return mutation;
};
