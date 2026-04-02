CREATE TABLE IF NOT EXISTS "public"."shipping_methods" (
    "id" bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" "text",
    "type" "text",
    "price" numeric,
    "percentage" numeric,
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."shipping_methods" OWNER TO "postgres";

CREATE INDEX "idx_shipping_methods_type" ON "public"."shipping_methods" USING "btree" ("type");
