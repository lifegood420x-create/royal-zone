CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" text NOT NULL,
	"username" text,
	"first_name" text NOT NULL,
	"photo_url" text,
	"balance" numeric(14, 2) DEFAULT 0 NOT NULL,
	"total_earned" numeric(14, 2) DEFAULT 0 NOT NULL,
	"total_withdrawn" numeric(14, 2) DEFAULT 0 NOT NULL,
	"referral_code" text NOT NULL,
	"referred_by" integer,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"flag_reason" text,
	"vpn_strike_count" integer DEFAULT 0 NOT NULL,
	"vpn_block_until" timestamp with time zone,
	"registration_ip" text,
	"registration_device" text,
	"rejected_withdraw_count" integer DEFAULT 0 NOT NULL,
	"ad_watch_date" date,
	"ad_watch_count_today" integer DEFAULT 0 NOT NULL,
	"total_tasks_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"reward" numeric(14, 2) NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"reward" numeric(14, 2) NOT NULL,
	"type" text DEFAULT 'other' NOT NULL,
	"link" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"method" text NOT NULL,
	"account_number" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "ad_watches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"network" text NOT NULL,
	"reward" numeric(14, 2) NOT NULL,
	"watched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'client' NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"claim_id" text,
	"confirmed_at" timestamp with time zone,
	CONSTRAINT "ad_watches_claim_id_unique" UNIQUE("claim_id")
);
--> statement-breakpoint
CREATE TABLE "app_config" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"min_withdraw" numeric(14, 2) DEFAULT 1020 NOT NULL,
	"referral_bonus" numeric(14, 2) DEFAULT 50 NOT NULL,
	"ad_reward" numeric(14, 2) DEFAULT 5 NOT NULL,
	"ad_daily_limit" integer DEFAULT 20 NOT NULL,
	"ad_duration_seconds" integer DEFAULT 15 NOT NULL,
	"bot_name" text DEFAULT 'Monetage CMP' NOT NULL,
	"bot_username" text DEFAULT 'Monetage_cpm_bot' NOT NULL,
	"channel_username" text,
	"admin_username" text DEFAULT 'admin' NOT NULL,
	"monetag_zone_id" text,
	"adsgram_block_id" text,
	"monetag_enabled" boolean DEFAULT true NOT NULL,
	"adsgram_enabled" boolean DEFAULT true NOT NULL,
	"postback_secret" text,
	"require_ad_postback" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_watches" ADD CONSTRAINT "ad_watches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;