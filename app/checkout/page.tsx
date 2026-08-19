import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address")
    .eq("id", user.id)
    .single();

  return (
    <CheckoutForm
      profile={{
        full_name: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        address: profile?.address ?? null,
      }}
    />
  );
}