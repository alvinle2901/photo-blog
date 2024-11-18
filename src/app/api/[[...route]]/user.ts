import { eq } from 'drizzle-orm';
import { Context, Hono } from 'hono';
import { z } from 'zod';

import { type AuthConfig, initAuthConfig, verifyAuth } from '@hono/auth-js';
import { zValidator } from '@hono/zod-validator';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';

import authConfig from '../../../../auth.config';

const app = new Hono().use('*', initAuthConfig(getAuthConfig)).patch(
  '/',
  verifyAuth(),
  zValidator(
    'json',
    z.object({
      name: z.string().optional(),
      image: z.string().optional(),
      password: z.string().optional(),
    }),
  ),
  async (c) => {
    const auth = c.get('authUser');
    const values = c.req.valid('json');

    console.log(values);

    //console.log(auth);

    if (!auth) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [data] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, auth.token?.sub!))
      .returning();

    if (!data) {
      return c.json({ error: 'Not found' }, 404);
    }

    return c.json({ data });
  },
);

function getAuthConfig(c: Context): AuthConfig {
  return { ...authConfig };
}

export default app;
