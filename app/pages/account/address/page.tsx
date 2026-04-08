import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import AddressContent from "./AddressContent";

export default async function AddressPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(APP_ROUTE.signin);
  }

  const currentPage = parseInt(sp.page || "1", 10);
  const pageSize = 4;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("addresses")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch server-side addresses:", error);
  }

  return (
    <AddressContent
      initialAddresses={data || []}
      initialTotalCount={count || 0}
      initialPage={currentPage}
      userId={user.id}
    />
  );
}
