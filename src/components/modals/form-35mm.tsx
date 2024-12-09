import { useForm } from 'react-hook-form';

import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/TextArea';

import { insert35mmPhotoSchema } from '@/db/schema';
import { Button } from '../ui/Button';

const FormSchema = insert35mmPhotoSchema.pick({
  title: true,
  film: true,
});

interface Props {
  isReady: boolean;
  handSubmit: (values: z.infer<typeof FormSchema>) => Promise<void>;
  status: string;
}

const Form35mm = ({ isReady, handSubmit, status }: Props) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      film: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="title"
          disabled={!isReady}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input disabled={false} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="film"
          disabled={!isReady}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Film</FormLabel>
              <FormControl>
                <Textarea disabled={false} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" variant="primary" className="w-full" disabled={!isReady}>
          {status}
        </Button>
      </form>
    </Form>
  );
};

export default Form35mm;
