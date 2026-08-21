import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  async function sendMessage(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const subject = (formData.get("subject") as string)?.trim() || null;
    const message = (formData.get("message") as string)?.trim();

    if (!name || name.length < 2) {
      return redirect("/contacto?error=invalid_name");
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return redirect("/contacto?error=invalid_email");
    }
    if (!message || message.length < 5) {
      return redirect("/contacto?error=invalid_message");
    }
    if (message.length > 2000) {
      return redirect("/contacto?error=message_too_long");
    }

    const { error: insertError } = await supabase.from("contact_messages").insert({
      user_id: user?.id || null,
      name,
      email,
      subject,
      message,
    });

    if (insertError) {
      return redirect("/contacto?error=send_failed");
    }

    return redirect("/contacto?success=sent");
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="glass mx-auto max-w-xl animate-fade-up rounded-2xl p-8 shadow-xl">
        <h1 className="mb-4 font-caveat text-3xl text-reni-purple-dark">
          Contáctanos
        </h1>

        {success === "sent" && (
          <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            ¡Mensaje enviado correctamente! Te responderemos pronto.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {
              {
                invalid_name: "Escribe tu nombre (mínimo 2 caracteres).",
                invalid_email: "Escribe un correo electrónico válido.",
                invalid_message: "Escribe un mensaje (mínimo 5 caracteres).",
                message_too_long: "El mensaje es demasiado largo (máx. 2000 caracteres).",
                send_failed: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
              }[error] ?? "Ocurrió un error. Revisa los campos e inténtalo de nuevo."
            }
          </p>
        )}

        <form className="space-y-4">
          <input
            name="name"
            placeholder="Tu nombre"
            required
            className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
          />
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
          />
          <input
            name="subject"
            placeholder="Asunto"
            className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
          />
          <textarea
            name="message"
            placeholder="Escribe tu mensaje..."
            required
            rows={5}
            className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
          ></textarea>
          <button
            type="submit"
            formAction={sendMessage}
            className="w-full rounded-lg bg-gradient-to-r from-reni-purple to-reni-pink py-3 font-bold text-white transition hover:opacity-90"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
