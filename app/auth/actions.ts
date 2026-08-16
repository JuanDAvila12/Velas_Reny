"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type OAuthProvider = "google" | "facebook";

/**
 * Inicia el flujo OAuth con Supabase.
 *
 * - `signInWithOAuth` devuelve una URL del proveedor; redirigimos ahí.
 * - El proveedor vuelve a `${SITE_URL}/auth/callback` con un `code`,
 *   que `app/auth/callback/route.ts` intercambia por una sesión.
 */
async function signInWithOAuth(provider: OAuthProvider) {
  const supabase = await createClient();

  // En producción define NEXT_PUBLIC_SITE_URL=https://velas-reny.vercel.app
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return redirect("/login?error=oauth_error");
  }

  return redirect(data.url);
}

export async function signInWithGoogle() {
  return signInWithOAuth("google");
}

export async function signInWithFacebook() {
  return signInWithOAuth("facebook");
}
