import {
  pgTable,
  varchar,
  text,
  real,
  json,
  timestamp,
  boolean,
  integer,
  smallint,
  doublePrecision,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const photos = pgTable('photos', {
  id:                  varchar('id', { length: 36 }).primaryKey(),
  url:                 text('url').notNull(),
  extension:           varchar('extension', { length: 10 }).notNull(),
  aspectRatio:         real('aspect_ratio').notNull(),
  blurData:            text('blur_data'),
  colorData:           json('color_data'),
  title:               varchar('title', { length: 255 }),
  caption:             text('caption'),
  semanticDescription: text('semantic_description'),
  tags:                text('tags').array(),
  takenAt:             timestamp('taken_at', { withTimezone: true }),
  takenAtNaive:        varchar('taken_at_naive', { length: 30 }),
  make:                varchar('make', { length: 100 }),
  model:               varchar('model', { length: 100 }),
  focalLength:         smallint('focal_length'),
  focalLength35mm:     smallint('focal_length_35mm_equivalent'),
  fStop:               real('f_number'),
  iso:                 smallint('iso'),
  exposureTime:        real('exposure_time'),
  exposureComp:        real('exposure_compensation'),
  latitude:            doublePrecision('latitude'),
  longitude:           doublePrecision('longitude'),
  filmSimulation:      varchar('film_simulation', { length: 50 }),
  recipeData:          json('recipe_data'),
  hidden:              boolean('hidden').notNull().default(false),
  priorityOrder:       real('priority_order'),
  createdAt:           timestamp('created_at').notNull().defaultNow(),
  updatedAt:           timestamp('updated_at').notNull().defaultNow(),
});

export const albums = pgTable('albums', {
  id:          varchar('id', { length: 36 }).primaryKey(),
  title:       varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  coverPhotoId: varchar('cover_photo_id', { length: 36 })
                  .references(() => photos.id, { onDelete: 'set null' }),
  hidden:      boolean('hidden').notNull().default(false),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

export const albumPhotos = pgTable('album_photos', {
  albumId:  varchar('album_id', { length: 36 })
              .notNull()
              .references(() => albums.id, { onDelete: 'cascade' }),
  photoId:  varchar('photo_id', { length: 36 })
              .notNull()
              .references(() => photos.id, { onDelete: 'cascade' }),
  order:    integer('order').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.albumId, t.photoId] }),
}));