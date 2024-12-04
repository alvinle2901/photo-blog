'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import * as z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';

import { login } from '@/actions/auth';
import { cn } from '@/utils/cn';

export const LoginSchema = z.object({
  email: z.string().min(1, {
    message: 'Email must be required.',
  }),
  password: z.string().min(1, {
    message: 'Password must be required.',
  }),
  rememberMe: z.boolean().optional(),
});

const LoginForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedPassword = localStorage.getItem('password');
    const storedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (storedEmail && storedPassword) {
      form.setValue('email', storedEmail);
      form.setValue('password', storedPassword);
      form.setValue('rememberMe', storedRememberMe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError('');
    setSuccess('');

    if (values.rememberMe) {
      localStorage.setItem('email', values.email);
      localStorage.setItem('password', values.password);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      localStorage.removeItem('rememberMe');
    }

    startTransition(() => {
      login(values).then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
      });
    });
  };

  return (
    <div className="flex w-full flex-col items-center space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <h3 className="text-muted-foreground">Enter your credentials to Log in</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-4/5 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground">Email address</FormLabel>

                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="hello@ecarry.me"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-muted-foreground">Password</FormLabel>

                <FormControl>
                  <Input disabled={isPending} {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      disabled={isPending}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={cn(isPending && 'text-muted-foreground')}>
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {error && <div className="text-center text-red-500">{error}</div>}

          <Button disabled={isPending} className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
