import { createClient } from "./server";

/**
 * Devuelve el usuario autenticado actual (o null si no hay sesión).
 * Usa `getUser()` (validado contra el servidor de Auth) en lugar de
 * `getSession()`, que solo lee el token local sin verificarlo.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Verifica si el usuario autenticado es administrador consultando
 * `profiles.is_admin`. La fuente de verdad del rol es la base de datos,
 * no los metadatos del usuario (que son editables por el cliente).
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin === true;
}
