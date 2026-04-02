import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Middleware: Supabase env is missing");
      return NextResponse.redirect(new URL("/pages/admin/login", request.url));
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthPage = pathname === "/pages/admin/login" || pathname === "/pages/admin/signup";

    if (!user) {
      if (isAuthPage) return response;
      return NextResponse.redirect(new URL("/pages/admin/login", request.url));
    }

    // AUTH OPTIMIZATION: Trust JWT metadata for role if present
    const metaRole = (user.app_metadata?.role || user.user_metadata?.role || "").toLowerCase();
    if (metaRole === "admin") {
      if (isAuthPage) {
        return NextResponse.redirect(new URL("/pages/admin/dashboard", request.url));
      }
      return response;
    }

    // Fallback: only check DB if metadata is missing
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = (profile?.role || "").trim().toLowerCase() === "admin";

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAuthPage) {
      return NextResponse.redirect(new URL("/pages/admin/dashboard", request.url));
    }

    return response;
  } catch (error) {
    console.error("Middleware Auth Check Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/pages/admin/:path*",
};
