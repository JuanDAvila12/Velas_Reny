import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SocialAuthButtons from "@/components/SocialAuthButtons";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Credenciales incorrectas. Verifica tu correo y contraseña.",
  email_not_confirmed: "Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.",
  oauth_error: "No se pudo iniciar sesión con el proveedor social. Inténtalo de nuevo.",
  auth: "Ocurrió un error al iniciar sesión. Inténtalo de nuevo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return redirect("/login?error=auth");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        return redirect("/login?error=email_not_confirmed");
      }
      if (msg.includes("invalid login credentials")) {
        return redirect("/login?error=invalid_credentials");
      }
      return redirect("/login?error=auth");
    }

    return redirect("/perfil");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-sm animate-fade-up space-y-4 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-caveat text-reny-purple-dark">
          Iniciar sesión
        </h1>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.auth}
          </p>
        )}
        {message === "check_email" && (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Revisa tu correo para confirmar tu cuenta.
          </p>
        )}

        <form className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
          />
          <button
            type="submit"
            formAction={login}
            className="w-full rounded-lg bg-gradient-to-r from-reny-purple to-reny-pink py-3 font-bold text-white transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>

        <SocialAuthButtons />

        <p className="text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-reny-pink-dark underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
