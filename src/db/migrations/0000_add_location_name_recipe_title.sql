CREATE TABLE "album_photos" (
	"album_id" varchar(36) NOT NULL,
	"photo_id" varchar(36) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "album_photos_album_id_photo_id_pk" PRIMARY KEY("album_id","photo_id")
);
--> statement-breakpoint
CREATE TABLE "albums" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"cover_photo_id" varchar(36),
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"extension" varchar(10) NOT NULL,
	"aspect_ratio" real NOT NULL,
	"blur_data" text,
	"color_data" json,
	"title" varchar(255),
	"caption" text,
	"semantic_description" text,
	"tags" text[],
	"taken_at" timestamp with time zone,
	"taken_at_naive" varchar(30),
	"make" varchar(100),
	"model" varchar(100),
	"focal_length" smallint,
	"focal_length_35mm_equivalent" smallint,
	"f_number" real,
	"iso" smallint,
	"exposure_time" real,
	"exposure_compensation" real,
	"latitude" double precision,
	"longitude" double precision,
	"location_name" varchar(255),
	"film_simulation" varchar(50),
	"recipe_title" varchar(255),
	"recipe_data" json,
	"hidden" boolean DEFAULT false NOT NULL,
	"priority_order" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "album_photos" ADD CONSTRAINT "album_photos_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_photos" ADD CONSTRAINT "album_photos_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_cover_photo_id_photos_id_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;