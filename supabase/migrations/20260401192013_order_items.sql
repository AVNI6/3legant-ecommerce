CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" integer NOT NULL,
    "order_id" integer NOT NULL REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "product_id" bigint NOT NULL REFERENCES "public"."products"("id") ON DELETE RESTRICT,
    "price" numeric(10,2) NOT NULL,
    "quantity" integer DEFAULT 1,
    "variant_id" bigint REFERENCES "public"."product_variant"("id") ON DELETE SET NULL,
    "color" "text",
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."order_items" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."order_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."order_items_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "public"."order_items_id_seq" OWNED BY "public"."order_items"."id";
ALTER TABLE ONLY "public"."order_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."order_items_id_seq"'::"regclass");

CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");
CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id");
CREATE INDEX "idx_order_items_variant" ON "public"."order_items" USING "btree" ("variant_id");
CREATE INDEX "idx_order_items_variant_id" ON "public"."order_items" USING "btree" ("variant_id");
