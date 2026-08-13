import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-caveat text-reny-purple-dark">
          Velas Reny
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/productos" className="hover:text-reny-pink-dark">
            Catálogo
          </Link>
          <Link href="/sobre-nosotros" className="hover:text-reny-pink-dark">
            Nosotros
          </Link>
          <Link href="/contacto" className="hover:text-reny-pink-dark">
            Contacto
          </Link>
          {user ? (
            <Link
              href="/perfil"
              className="bg-reny-purple text-white px-3 py-1 rounded-full"
            >
              Mi cuenta
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-reny-pink text-black px-3 py-1 rounded-full"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}