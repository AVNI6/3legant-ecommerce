CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" bigint NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "question" "text" NOT NULL,
    "answer" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."questions" OWNER TO "postgres";

CREATE INDEX "idx_questions_created_at" ON "public"."questions" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_questions_product_id" ON "public"."questions" USING "btree" ("product_id");
CREATE INDEX "idx_questions_user_id" ON "public"."questions" USING "btree" ("user_id");
