CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "address_type" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "street" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "country" "text",
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "address_label" "text" DEFAULT 'Home'::"text",
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_user_address" UNIQUE ("user_id", "street", "city", "state", "zip", "country")
);

ALTER TABLE "public"."addresses" OWNER TO "postgres";

CREATE INDEX "idx_addresses_created_at" ON "public"."addresses" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_addresses_user_created" ON "public"."addresses" USING "btree" ("user_id", "created_at" DESC);
CREATE INDEX "idx_addresses_user_default" ON "public"."addresses" USING "btree" ("user_id", "is_default");
CREATE INDEX "idx_addresses_user_id" ON "public"."addresses" USING "btree" ("user_id");
CREATE INDEX "idx_addresses_user_type" ON "public"."addresses" USING "btree" ("user_id", "address_type");
