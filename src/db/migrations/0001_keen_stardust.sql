CREATE TABLE "film_photos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" varchar(255),
	"description" text,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"film" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
