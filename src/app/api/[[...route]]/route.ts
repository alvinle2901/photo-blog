import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import photos from './photos';
import photos_35mm from './photos_35mm';
import summary from './summary';
import user from './user';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

const routes = app
  .route('/photos', photos)
  .route('/summary', summary)
  .route('/user', user)
  .route('/photos_35mm', photos_35mm);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
