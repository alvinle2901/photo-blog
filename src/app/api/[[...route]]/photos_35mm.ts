import { and, asc, desc, eq, gte, lt } from 'drizzle-orm';
import { Context, Hono } from 'hono';
import { z } from 'zod';

import { type AuthConfig, initAuthConfig, verifyAuth } from '@hono/auth-js';
import { zValidator } from '@hono/zod-validator';

import { db } from '@/db/drizzle';
import { insert35mmPhotoSchema, photos_35mm } from '@/db/schema';

import authConfig from '../../../../auth.config';

const app = new Hono()
  .use('*', initAuthConfig(getAuthConfig))
  .get('/', async (c) => {
    const query = db.select().from(photos_35mm);

    const data = await query;

    return c.json({
      data,
    });
  })
  .post('/', verifyAuth(), zValidator('json', insert35mmPhotoSchema), async (c) => {
    const auth = c.get('authUser');
    const values = c.req.valid('json');

    if (!auth) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [data] = await db
      .insert(photos_35mm)
      .values({
        ...values,
      })
      .returning();

    return c.json({ data });
  })
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Invalid id' }, 400);
      }

      const [data] = await db.select().from(photos_35mm).where(eq(photos_35mm.id, id));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    },
  )
  .patch(
    '/:id',
    verifyAuth(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      }),
    ),
    zValidator(
      'json',
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser');
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      if (!auth) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db
        .update(photos_35mm)
        .set(values)
        .where(eq(photos_35mm.id, id))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    },
  )
  .delete(
    '/:id',
    verifyAuth(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser');
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      if (!auth) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db.delete(photos_35mm).where(eq(photos_35mm.id, id)).returning();

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
