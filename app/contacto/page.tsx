import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function ContactPage() {
  async function sendMessage(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    await supabase.from("contact_messages").insert({
      user_id: user?.id || null,
      name,
      email,
      subject,
      message,
    });

    return redirect("/contacto?success=Mensaje enviado");
  }

  return (
    <div className="min-h-screen bg-reny-cream py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-caveat text-reny-purple-dark mb-4">
          Contáctanos
        </h1>
        <form className="space-y-4">
          <input
            name="name"
            placeholder="Tu nombre"
            required
            className="w-full p-3 border border-reny-purple rounded-lg"
          />
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            className="w-full p-3 border border-reny-purple rounded-lg"
          />
          <input
            name="subject"
            placeholder="Asunto"
            className="w-full p-3 border border-reny-purple rounded-lg"
          />
          <textarea
            name="message"
            placeholder="Escribe tu mensaje..."
            required
            rows={5}
            className="w-full p-3 border border-reny-purple rounded-lg"
          ></textarea>
          <button
            formAction={sendMessage}
            className="w-full bg-reny-purple hover:bg-reny-purple-dark text-white font-bold py-3 rounded-lg transition"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}