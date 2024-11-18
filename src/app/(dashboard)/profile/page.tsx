import React from 'react';

import { Metadata } from 'next';

import { auth } from '@/lib/auth';

import { UserForm } from './form';

export const metadata: Metadata = {
  title: 'Settings',
};

const SettingsPage = async () => {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <section className="space-y-8 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">User account</h1>
        <p className="text-sm text-muted-foreground">
          Update your photo and personal details here.
        </p>
      </div>

      <UserForm name={session?.user.name} image={session?.user.image} email={session?.user.email} />
    </section>
  );
};

export default SettingsPage;
