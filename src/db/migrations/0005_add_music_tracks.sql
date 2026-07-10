CREATE TABLE "music_tracks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "music_tracks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"spotify_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"artist_names" text NOT NULL,
	"album_name" varchar(255) DEFAULT '' NOT NULL,
	"album_art_url" text,
	"spotify_url" text,
	"youtube_video_id" varchar(20),
	"playlist_spotify_id" varchar(100) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
