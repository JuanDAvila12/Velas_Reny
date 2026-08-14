import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 shadow-md overflow-hidden">
      {/* Imagen de fondo animada */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
        style={{ backgroundImage: "url('/images/velas-fondo.jpg')" }}
      ></div>
      {/* Capa oscura/gradiente para que el texto se lea */}
      <div className="absolute inset-0 bg-gradient-to-r from-reny-purple-dark/90 via-reny-purple/70 to-reny-pink-dark/80"></div>

      {/* Contenido del navbar */}
      <div className="relative max-w-6xl mx-auto flex justify-between items-center p-4 text-white">
        <Link href="/" className="text-2xl font-caveat drop-shadow-lg">
          Velas Reny
        </Link>
        <div className="flex gap-4 items-center text-sm sm:text-base">
          <Link href="/productos" className="hover:text-reny-pink-dark transition">
            Catálogo
          </Link>
          <Link href="/sobre-nosotros" className="hover:text-reny-pink-dark transition">
            Nosotros
          </Link>
          <Link href="/contacto" className="hover:text-reny-pink-dark transition">
            Contacto
          </Link>
          {user ? (
            <Link
              href="/perfil"
              className="bg-white/90 text-reny-purple-dark px-3 py-1 rounded-full font-bold shadow"
            >
              Mi cuenta
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-white/90 text-reny-pink-dark px-3 py-1 rounded-full font-bold shadow"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
