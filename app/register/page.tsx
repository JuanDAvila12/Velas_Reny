import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  async function register(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return redirect("/register?error=Error al registrarse");
    }

    // El perfil se crea automáticamente por el trigger
    return redirect("/login?message=Revisa tu correo para confirmar la cuenta");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-reny-cream">
      <form className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h1 className="text-3xl font-caveat text-reny-purple-dark text-center">
          Crear cuenta
        </h1>
        <input
          name="fullName"
          type="text"
          placeholder="Nombre completo"
          required
          className="w-full p-3 border border-reny-purple rounded-lg focus:outline-none focus:ring-2 focus:ring-reny-pink"
        />
        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          required
          className="w-full p-3 border border-reny-purple rounded-lg focus:outline-none focus:ring-2 focus:ring-reny-pink"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          className="w-full p-3 border border-reny-purple rounded-lg focus:outline-none focus:ring-2 focus:ring-reny-pink"
        />
        <button
          type="submit"
          className="w-full bg-reny-pink hover:bg-reny-pink-dark text-white font-bold py-3 rounded-lg transition"
        >
          Registrarse
        </button>
        <p className="text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-reny-purple-dark underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}