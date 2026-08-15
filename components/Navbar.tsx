import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <nav className="sticky top-0 z-50 overflow-hidden shadow-md">
      {/* Imagen de fondo animada */}
      <div
        className="absolute inset-0 animate-slow-zoom bg-cover bg-center"
        style={{ backgroundImage: "url('/images/velas-fondo.jpg')" }}
      ></div>
      {/* Capa oscura/gradiente para que el texto se lea */}
      <div className="absolute inset-0 bg-gradient-to-r from-reny-purple-dark/90 via-reny-purple/70 to-reny-pink-dark/80"></div>

      {/* Contenido del navbar */}
      <div className="relative mx-auto flex max-w-6xl items-center justify-between p-4 text-white">
        <Link href="/" className="text-2xl font-caveat drop-shadow-lg">
          Velas Reny
        </Link>
        <div className="flex items-center gap-4 text-sm sm:text-base">
          <Link
            href="/productos"
            className="transition hover:text-reny-pink-dark"
          >
            Catálogo
          </Link>
          <Link
            href="/sobre-nosotros"
            className="hidden transition hover:text-reny-pink-dark sm:inline"
          >
            Nosotros
          </Link>
          <Link
            href="/contacto"
            className="transition hover:text-reny-pink-dark"
          >
            Contacto
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full bg-white/90 px-3 py-1 font-bold text-reny-purple-dark shadow transition hover:bg-white"
            >
              Admin
            </Link>
          )}
          {user ? (
            <Link
              href="/perfil"
              className="rounded-full bg-white/90 px-3 py-1 font-bold text-reny-purple-dark shadow transition hover:bg-white"
            >
              Mi cuenta
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white/90 px-3 py-1 font-bold text-reny-pink-dark shadow transition hover:bg-white"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
