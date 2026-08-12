import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?error=Credenciales incorrectas");
    }

    return redirect("/perfil");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-reny-cream">
      <form className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h1 className="text-3xl font-caveat text-reny-purple-dark text-center">
          Iniciar sesión
        </h1>
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
          className="w-full bg-reny-purple hover:bg-reny-purple-dark text-white font-bold py-3 rounded-lg transition"
        >
          Entrar
        </button>
        <p className="text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-reny-pink-dark underline">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}