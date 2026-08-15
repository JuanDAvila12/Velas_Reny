import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  email_taken: "Ya existe una cuenta con este correo electrónico.",
  weak_password: "La contraseña debe tener al menos 6 caracteres.",
  auth: "Ocurrió un error al registrarte. Inténtalo de nuevo.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function register(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    if (!email || !password || !fullName) {
      return redirect("/register?error=auth");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        return redirect("/register?error=email_taken");
      }
      if (msg.includes("password")) {
        return redirect("/register?error=weak_password");
      }
      return redirect("/register?error=auth");
    }

    if (data?.session) {
      return redirect("/perfil");
    }

    return redirect("/login?message=check_email");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-sm animate-fade-up space-y-4 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-caveat text-reny-purple-dark">
          Crear cuenta
        </h1>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.auth}
          </p>
        )}

        <form className="space-y-4">
          <input
            name="fullName"
            type="text"
            placeholder="Nombre completo"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
          />
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
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
          />
          <button
            type="submit"
            formAction={register}
            className="w-full rounded-lg bg-gradient-to-r from-reny-purple to-reny-pink py-3 font-bold text-white transition hover:opacity-90"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-reny-purple-dark underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
