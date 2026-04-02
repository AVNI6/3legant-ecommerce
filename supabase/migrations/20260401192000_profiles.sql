CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "role" "text" DEFAULT 'user'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text",
    "email" "text",
    "avatar_url" "text",
    "is_blocked" boolean DEFAULT false,
    PRIMARY KEY ("id"),
    CONSTRAINT "profiles_email_unique" UNIQUE ("email")
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE INDEX "idx_profiles_created_at" ON "public"."profiles" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");
