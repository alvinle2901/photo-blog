# 📷 Momento - An Open-source Photo Blog

An open-source photo blog to showcase my shots within my life journey. Buildt with Next.js 14, Auth.js v5, Hono.js, React Query, Tailwind CSS.

<img src="https://i.ibb.co/BsNFxR4/Screenshot-2024-12-03-115400.png" alt="Sample Image" width="100%">

[![Deploy with Vercel](https://vercel.com/button)]()
Demo App

https://shot-by-alv.us.kg/

## Features

- Built-in auth
- Admin panel (/dashboard)
- Photo upload with EXIF extraction
- Infinite scroll
- A map to show where the photos are shot (also where have I been to as a traveler)
- A showcase only for film photos (35mm)
- CMD-K menu with photo search

<img src="https://i.ibb.co/2sdQSK9/Screenshot-2024-12-03-130737.png" alt="Sample Image" width="90%">
<img src="https://i.ibb.co/sgNNmKD/Screenshot-2024-12-03-131032.png" alt="Sample Image" width="90%">

## Roadmap

- [x] Authentication.
- [x] Set up Drizzle & PostgreSQL database.
- [x] Upload image using [Uploadthing](https://uploadthing.com)
- [x] Read and format EXIF data
- [x] Build ui
- [x] Add [Mapbox API](https://www.mapbox.com) and its layer
- [x] Implement Grid photo gallery
- [x] Implement db & ui for 35mm film photo

- [ ] Implement search/filter for CMD-K menu & /dashboard
- [ ] Get film simulation from Fujifilm's photos
- [ ] Implement page for polaroid photos
- [ ] Implement dark theme 
- [ ] Upload photos to Cloudflare R2/ AWS S3
- [ ] Implements tags based on the photos for filtering

## Steps to reproduce:

### Clone the repo

```shell
git clone https://github.com/alvinle2901/photo-blog.git
```

### Pre-requirements

#### DB

I used [Vercel Storage](https://vercel.com/) for your database. It's free and easy to setup. Once you have your database setup, you will need to add the connection string to your `.env.local` file.

```.env.local
AUTH_DRIZZLE_URL="postgres://"
POSTGRES_URL="postgres://"
```

Generate the migration

```sh
bun run db:generate
```

Run the migrations

```sh
bun run db:migrate
```

#### Init User

Add env variables

```.env.local
USER_EMAIL=
USERNAME=
USER_PASSWORD=
```

```sh
bun run db:seed
```

#### Mapbox

To get a Mapbox token, you will need to register on [their website](https://www.mapbox.com/). The token will be used to identify you and start serving up map tiles. The service is free until a certain level of traffic is exceeded.

```.env.local
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

### Install dependencies

```shell
npm install
```

### ESLint and Prettier fix

```shell
npm run format
```

### Start the app

```shell
npm run dev
```

## Credits
- This project is inspired from Sam Becker's [EXIF Photo Blog](https://github.com/sambecker/exif-photo-blog)
