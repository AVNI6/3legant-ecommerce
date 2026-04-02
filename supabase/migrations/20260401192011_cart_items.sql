CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cart_id" "uuid" NOT NULL REFERENCES "public"."cart"("id") ON DELETE CASCADE,
    "product_id" bigint NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "variant_id" bigint REFERENCES "public"."product_variant"("id") ON DELETE SET NULL,
    "color" "text",
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."cart_items" OWNER TO "postgres";

CREATE INDEX "idx_cart_items_cart_id" ON "public"."cart_items" USING "btree" ("cart_id");
CREATE INDEX "idx_cart_items_product_id" ON "public"."cart_items" USING "btree" ("product_id");
CREATE INDEX "idx_cart_items_variant" ON "public"."cart_items" USING "btree" ("variant_id");
CREATE INDEX "idx_cart_items_variant_id" ON "public"."cart_items" USING "btree" ("variant_id");
