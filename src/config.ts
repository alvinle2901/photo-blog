import { z } from "zod";

const schema = z.object({
	// Database
	DATABASE_URL: z.string().url(),

	// Cloudflare R2
	R2_ACCOUNT_ID: z.string(),
	R2_ACCESS_KEY_ID: z.string(),
	R2_SECRET_ACCESS_KEY: z.string(),
	R2_BUCKET: z.string(),
	R2_PUBLIC_URL: z.string().url(), // public bucket URL or custom domain

	// Auth
	AUTH_SECRET: z.string().min(32),
	ADMIN_EMAIL: z.string().email(),
	ADMIN_PASSWORD: z.string().min(8),

	// AI (optional)
	OPENAI_API_KEY: z.string().optional(),
	AI_ENABLED: z.coerce.boolean().default(false),

	// Public
	NEXT_PUBLIC_SITE_URL: z.string().url(),
	NEXT_PUBLIC_MUSIC_WORKER_HEALTH_URL: z.string().url().optional(),

	// Music worker
	MUSIC_WORKER_SECRET: z.string().min(32).optional(),
	MUSIC_WORKER_URL: z.string().url().optional(),
});

export const config = schema.parse(process.env);
