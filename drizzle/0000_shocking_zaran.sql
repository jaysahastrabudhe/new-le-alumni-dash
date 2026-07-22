CREATE TABLE IF NOT EXISTS "app_sections" (
	"key" text PRIMARY KEY NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'alumni' NOT NULL;
