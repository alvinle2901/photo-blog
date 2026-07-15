CREATE INDEX "photos_camera_taken_idx" ON "photos" USING btree ("make","model","taken_at" DESC NULLS LAST,"created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "photos_film_taken_idx" ON "photos" USING btree ("film_simulation","taken_at" DESC NULLS LAST,"created_at" DESC NULLS LAST);
