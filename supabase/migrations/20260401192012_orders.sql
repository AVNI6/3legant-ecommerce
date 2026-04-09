CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" integer NOT NULL,
    "user_id" "uuid" REFERENCES auth.users(id),
    "total_price" numeric NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "order_date" timestamp without time zone DEFAULT "now"(),
    "shipping_address" json NOT NULL,
    "payment_method" "text" NOT NULL,
    "billing_address" json,
    "items_snapshot" "jsonb",
    "invoice_url" "text",
    "invoice_sent_at" timestamp with time zone,
    "refund_status" "text",
    "refund_amount" numeric(12,2) DEFAULT 0,
    "refund_reason" "text",
    "payment_intent_id" "text",
    "admin_note" "text",
    "coupon_code" "text",
    "discount_amount" numeric DEFAULT 0,
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."orders" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."orders_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "public"."orders_id_seq" OWNED BY "public"."orders"."id";
ALTER TABLE ONLY "public"."orders" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."orders_id_seq"'::"regclass");

CREATE INDEX "idx_orders_order_date" ON "public"."orders" USING "btree" ("order_date" DESC);
CREATE INDEX "idx_orders_refund_status" ON "public"."orders" USING "btree" ("refund_status") WHERE ("refund_status" IS NOT NULL);
CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");
CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");

COMMENT ON COLUMN "public"."orders"."refund_status" IS 'Refund status: pending, approved, rejected, processed';

ALTER TABLE public.orders 
ADD COLUMN delivered_at timestamp with time zone;
