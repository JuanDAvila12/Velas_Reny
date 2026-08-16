import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Callback de OAuth (Google / Facebook).
 *
 * Los proveedores redirigen aquí con un `code` de autorización.
 * Lo intercambiamos por una sesión con `exchangeCodeForSession`.
 * En caso de error, mandamos al usuario a `/login?error=oauth_error`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Evita open redirect: solo rutas internas (empiezan con "/" y no con "//").
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_error`);
}
