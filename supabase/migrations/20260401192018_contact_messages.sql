CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
    "full_name" "text",
    "email" "text",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."contact_messages" OWNER TO "postgres";

CREATE INDEX "idx_contact_messages_created_at" ON "public"."contact_messages" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_contact_messages_email" ON "public"."contact_messages" USING "btree" ("email");
