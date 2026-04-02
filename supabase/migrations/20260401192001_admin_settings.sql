CREATE TABLE IF NOT EXISTS "public"."admin_settings" (
    "id" bigint NOT NULL,
    "setting_key" character varying(255) NOT NULL,
    "setting_value" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    CONSTRAINT "admin_settings_setting_key_key" UNIQUE ("setting_key")
);

ALTER TABLE "public"."admin_settings" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."admin_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."admin_settings_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "public"."admin_settings_id_seq" OWNED BY "public"."admin_settings"."id";
ALTER TABLE ONLY "public"."admin_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."admin_settings_id_seq"'::"regclass");

CREATE INDEX "idx_admin_settings_key" ON "public"."admin_settings" USING "btree" ("setting_key");

COMMENT ON TABLE "public"."admin_settings" IS 'Stores admin configuration settings like refund window days';
COMMENT ON COLUMN "public"."admin_settings"."setting_key" IS 'Unique key for the setting (e.g., refund_window_days)';
COMMENT ON COLUMN "public"."admin_settings"."setting_value" IS 'The value of the setting (stored as text, convert as needed)';
