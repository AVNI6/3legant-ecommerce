CREATE TABLE IF NOT EXISTS "public"."wishlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES auth.users(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "variant_id" bigint REFERENCES "public"."product_variant"("id") ON DELETE CASCADE,
    "color" "text",
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_user_variant_color" UNIQUE ("user_id", "variant_id", "color"),
    CONSTRAINT "wishlist_user_variant_unique" UNIQUE ("user_id", "variant_id")
);

ALTER TABLE "public"."wishlist" OWNER TO "postgres";

CREATE INDEX "idx_wishlist_created_at" ON "public"."wishlist" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_wishlist_user_id" ON "public"."wishlist" USING "btree" ("user_id");
CREATE INDEX "idx_wishlist_variant" ON "public"."wishlist" USING "btree" ("variant_id");
CREATE INDEX "idx_wishlist_variant_id" ON "public"."wishlist" USING "btree" ("variant_id");
