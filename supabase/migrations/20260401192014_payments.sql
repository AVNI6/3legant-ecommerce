CREATE TABLE IF NOT EXISTS "public"."payments" (
    "payment_id" "text" NOT NULL,
    "order_id" integer REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "transaction_id" "text",
    "method" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "user_id" "uuid" REFERENCES auth.users(id),
    "amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'usd'::"text" NOT NULL,
    "details" "jsonb",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("payment_id")
);

ALTER TABLE "public"."payments" OWNER TO "postgres";

CREATE INDEX "idx_payments_created_at" ON "public"."payments" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_payments_order_id" ON "public"."payments" USING "btree" ("order_id");
CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");
CREATE INDEX "idx_payments_user_id" ON "public"."payments" USING "btree" ("user_id");

CREATE OR REPLACE TRIGGER "trg_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_payments_updated_at"();
