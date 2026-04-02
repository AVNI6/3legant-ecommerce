CREATE TABLE IF NOT EXISTS "public"."cart" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."cart" OWNER TO "postgres";

CREATE INDEX "idx_cart_created_at" ON "public"."cart" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_cart_user_id" ON "public"."cart" USING "btree" ("user_id");
