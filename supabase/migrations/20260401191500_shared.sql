SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Enums
CREATE TYPE "public"."discount_type_enum" AS ENUM ('fixed', 'percentage');
ALTER TYPE "public"."discount_type_enum" OWNER TO "postgres";

CREATE TYPE "public"."order_status" AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded');
ALTER TYPE "public"."order_status" OWNER TO "postgres";

CREATE TYPE "public"."payment_status" AS ENUM ('pending', 'success', 'failed', 'refunded', 'expired');
ALTER TYPE "public"."payment_status" OWNER TO "postgres";

CREATE TYPE "public"."shipping_type" AS ENUM ('free', 'express', 'pickup');
ALTER TYPE "public"."shipping_type" OWNER TO "postgres";

CREATE TYPE "public"."user_role" AS ENUM ('user', 'admin');
ALTER TYPE "public"."user_role" OWNER TO "postgres";

-- Common Functions
CREATE OR REPLACE FUNCTION "public"."app_is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;
ALTER FUNCTION "public"."app_is_admin"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_toggle_user_block"("target_user_id" "uuid", "block_status" boolean) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    caller_role text;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only admins can block users');
    END IF;
    UPDATE public.profiles
    SET is_blocked = block_status
    WHERE id = target_user_id;
    RETURN jsonb_build_object('success', true, 'is_blocked', block_status);
END;
$$;
ALTER FUNCTION "public"."handle_toggle_user_block"("target_user_id" "uuid", "block_status" boolean) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_toggle_user_role"("target_user_id" "uuid", "new_role" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    caller_role text;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
    IF caller_role != 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only admins can manage roles');
    END IF;
    UPDATE public.profiles
    SET role = new_role
    WHERE id = target_user_id;
    RETURN jsonb_build_object('success', true, 'new_role', new_role);
END;
$$;
ALTER FUNCTION "public"."handle_toggle_user_role"("target_user_id" "uuid", "new_role" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND LOWER(TRIM(role)) = 'admin'
  );
END;
$$;
ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_payments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;
ALTER FUNCTION "public"."update_payments_updated_at"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";
