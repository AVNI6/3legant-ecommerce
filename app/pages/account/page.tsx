import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import AccountDetails from "./AccountDetails";

export default async function AccountPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect(APP_ROUTE.signin);
    }

    return <AccountDetails />;
}