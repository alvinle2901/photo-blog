'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';

import { toast } from 'sonner';
import { ExifData, ExifParserFactory } from 'ts-exif-parser';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/TextArea';

import { useCreate35mmPhoto } from '@/features/photos-35mm/api/use-create-photo';
import { useCreatePhoto } from '@/features/photos/api/use-create-photo';

import { getImageBlur } from '@/actions/photos';
import { insertPhotoSchema } from '@/db/schema';
import { useModal } from '@/hooks/use-create-modal';
import { formatExif } from '@/lib/format-exif';
import { getReverseGeocoding } from '@/lib/map';
import { UploadDropzone } from '@/lib/uploadthing';
import { cn } from '@/utils/cn';
import { getImageDimensionsFromFile } from '@/utils/get-image-size';
import { imageToBuffer } from '@/utils/image';

import { Icons } from '../icons';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';

type UploadData = {
  key: string;
  url: string;
  name: string;
  size: number;
};

const FormSchema = insertPhotoSchema.pick({
  title: true,
  description: true,
});

const CreatePhotoModal = () => {
  const [mode, setMode] = useState('digital');
  const [exif, setExif] = useState<ExifData>();
  const [res, setRes] = useState<UploadData | null>();
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<
    'Waiting for update photo' | 'Generate blur data' | 'Creating' | 'Retry'
  >('Waiting for update photo');

  const { isOpen, onClose } = useModal();

  const mutation = useCreatePhoto();
  const mutation35mm = useCreate35mmPhoto();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleImageUpload = async (file: File) => {
    const buffer = await imageToBuffer(file);

    const data = ExifParserFactory.create(buffer as Buffer).parse();

    // TODO: get Fuji's film simulation data
    const parser = ExifParserFactory.create(buffer as Buffer);
    parser.enableBinaryFields(true);
    const exifDataBinary = parser.parse();
    console.log(exifDataBinary);

    if (!data.imageSize) {
      const size = await getImageDimensionsFromFile(file);
      setSize(size);
    }

    setExif(data);
  };

  const handleClose = () => {
    setRes(null);
    onClose();
  };

  const handSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsReady(false);

    if (!res?.url) {
      toast.error('Please upload a photo');
      return;
    }
    console.log(exif);
    const exifData = formatExif(exif);
    if (!exif?.imageSize && !size) return;

    const address = await getReverseGeocoding(exifData?.longitude, exifData?.latitude);

    const { width, height } = exif?.imageSize || size || { width: 200, height: 200 };
    const aspectRatio = width / height;

    const blur = await getImageBlur(res?.url);

    if (!blur) {
      toast.error('Generated blur data fail');
      console.log('Generated blur data fail');
      setStatus('Retry');
      setIsReady(true);
      return;
    }

    setStatus('Creating');

    const data = {
      url: res.url,
      blurData: blur,
      width,
      height,
      locationName: address,
      aspectRatio,
      ...exifData,
      ...values,
    };

    mutation.mutate(data, {
      onSuccess: () => {
        handleClose();
        setRes(null);
        form.reset();
        setStatus('Waiting for update photo');
      },
    });
  };

  const hand35mmSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsReady(false);

    if (!res?.url) {
      toast.error('Please upload a photo');
      return;
    }

    if (!exif?.imageSize && !size) return;

    const { width, height } = exif?.imageSize || size || { width: 200, height: 200 };

    const blur = await getImageBlur(res?.url);

    if (!blur) {
      toast.error('Generated blur data fail');
      console.log('Generated blur data fail');
      setStatus('Retry');
      setIsReady(true);
      return;
    }

    setStatus('Creating');

    const data = {
      url: res.url,
      width: width,
      height: height,
      blurData: blur,
      ...values,
    };

    mutation35mm.mutate(data, {
      onSuccess: () => {
        handleClose();
        setRes(null);
        form.reset();
        setStatus('Waiting for update photo');
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload photo</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {res ? (
          <div className="relative h-[280px] w-full bg-muted">
            <Image
              src={res.url}
              alt={res.name}
              width={200}
              height={200}
              className={cn(
                'h-full w-full object-cover duration-700 ease-in-out',
                !res.url ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0',
              )}
            />
            <button
              disabled={!isReady}
              onClick={() => setRes(null)}
              className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm"
              type="button"
            >
              <Icons.x className="size-4" />
            </button>
          </div>
        ) : (
          <UploadDropzone
            className="ut-button:bg-sky-500 ut-label:text-sky-500 ut-button:ut-uploading:after:bg-sky-600"
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              setRes(res[0]);
              toast.success('Photo uploaded!');
              setIsReady(true);
              setStatus('Generate blur data');
            }}
            onUploadError={(error: Error) => {
              console.log(`ERROR! ${error.message}`);
              toast.error(error.message);
            }}
            onBeforeUploadBegin={(files) => {
              return files.map((file) => {
                handleImageUpload(file);

                return file;
              });
            }}
          />
        )}

        {/* Radio group */}
        <RadioGroup
          defaultValue={mode}
          className="mt-1 flex justify-between"
          onValueChange={(value) => {
            setMode(value);
          }}
        >
          <RadioGroupItem value={'digital'}>Digital</RadioGroupItem>
          <RadioGroupItem value={'35mm'}>35mm</RadioGroupItem>
          <RadioGroupItem value={'polaroid'}>Polaroid</RadioGroupItem>
        </RadioGroup>

        <Form {...form}>
          <form
            onSubmit={
              mode === 'digital' ? form.handleSubmit(handSubmit) : form.handleSubmit(hand35mmSubmit)
            }
            className="space-y-4 pt-2"
          >
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
              name="description"
              disabled={!isReady}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea disabled={false} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex items-center">
              {!res?.url ? (
                <p className={cn('text-xs text-muted-foreground')}>
                  <Icons.loader className="mr-2 inline-block size-2 animate-spin" />
                  Photo upload
                </p>
              ) : (
                <p className={cn('text-xs text-green-500')}>
                  <Icons.check className="mr-2 inline-block size-2" />
                  Photo upload
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={!isReady}>
              {status}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePhotoModal;
