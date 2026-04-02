CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email")
);

ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";

CREATE INDEX "idx_newsletter_subscribers_created_at" ON "public"."newsletter_subscribers" USING "btree" ("created_at" DESC);
