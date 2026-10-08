ALTER TABLE "app_config" ALTER COLUMN "bot_name" SET DEFAULT 'Monetage CMP';
--> statement-breakpoint
ALTER TABLE "app_config" ALTER COLUMN "bot_username" SET DEFAULT 'Monetage_cpm_bot';
--> statement-breakpoint
UPDATE "app_config"
SET "bot_name" = 'Monetage CMP', "bot_username" = 'Monetage_cpm_bot'
WHERE "id" = 1;
