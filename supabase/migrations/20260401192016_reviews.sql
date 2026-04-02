-- FINAL CORRECTED REVIEWS MIGRATION
-- (Fixes: 400 Bad Request, missing profile joins, and RLS violations)

-- 1. Clean up
DROP TABLE IF EXISTS "public"."review_likes" CASCADE;
DROP TABLE IF EXISTS "public"."review_replies" CASCADE;
DROP TABLE IF EXISTS "public"."reviews" CASCADE;

-- 2. Reviews Table
CREATE TABLE "public"."reviews" (
  "id" "uuid" NOT NULL DEFAULT "gen_random_uuid"(),
  "product_id" bigint NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
  "user_id" "uuid" REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  "name" "text" NOT NULL,
  "rating" integer NOT NULL,
  "comment" "text" DEFAULT NULL,
  "status" "text" DEFAULT NULL CHECK ("status" IN ('spam')),
  "created_at" timestamp with time zone DEFAULT "now"(),
  
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reviews_rating_check" CHECK (("rating" >= 1) AND ("rating" <= 5))
);

-- 3. Review Likes (JOIN-READY)
CREATE TABLE "public"."review_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL REFERENCES "public"."reviews"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    CONSTRAINT "uq_review_likes_user" UNIQUE ("review_id", "user_id")
);

-- 4. Review Replies (JOIN-READY)
CREATE TABLE "public"."review_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL REFERENCES "public"."reviews"("id") ON DELETE CASCADE,
    "user_id" "uuid" REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS "idx_reviews_product_id" ON "public"."reviews" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_created_at" ON "public"."reviews" ("created_at" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_reviews_product_user" ON "public"."reviews" ("product_id", "user_id") WHERE ("user_id" IS NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_review_likes_review_id" ON "public"."review_likes" ("review_id");
CREATE INDEX IF NOT EXISTS "idx_review_replies_review_id" ON "public"."review_replies" ("review_id");

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.review_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.review_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- 7. Security (ALL POLICIES INCLUDED)
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."review_replies" ENABLE ROW LEVEL SECURITY;

-- Select
CREATE POLICY "public read reviews" ON "public"."reviews" FOR SELECT USING (status IS NULL OR (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'));
CREATE POLICY "public read likes" ON "public"."review_likes" FOR SELECT USING (true);
CREATE POLICY "public read replies" ON "public"."review_replies" FOR SELECT USING (true);

-- Insert
CREATE POLICY "auth insert reviews" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth insert likes" ON "public"."review_likes" FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth insert replies" ON "public"."review_replies" FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = user_id);

-- Update/Delete
CREATE POLICY "auth update reviews" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (auth.uid() = user_id);
CREATE POLICY "auth delete reviews" ON "public"."reviews" FOR DELETE TO "authenticated" USING (auth.uid() = user_id);
CREATE POLICY "owner delete likes" ON "public"."review_likes" FOR DELETE TO "authenticated" USING (auth.uid() = user_id);
