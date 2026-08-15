import { createClient } from "@/lib/supabase/server";
import NavbarMenu from "./NavbarMenu";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El enlace "Admin" solo se muestra para administradores.
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin === true;
  }

  return <NavbarMenu isLoggedIn={!!user} isAdmin={isAdmin} />;
}
