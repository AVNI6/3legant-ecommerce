CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" "text" NOT NULL,
    "measurements" "text",
    "package" "text",
    "description" "text",
    "category" "text",
    "is_new" boolean DEFAULT true,
    "image" "text",
    "validation_till" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean DEFAULT false,
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."products" OWNER TO "postgres";

CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category");
CREATE INDEX "idx_products_created_at" ON "public"."products" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_products_is_new" ON "public"."products" USING "btree" ("is_new");
