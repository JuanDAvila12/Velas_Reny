import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  async function updateProfile(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone, address });

    redirect("/perfil");
  }

  return (
    <div className="min-h-screen bg-reny-cream p-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-caveat text-reny-purple-dark">
          Mi perfil
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre completo</label>
            <input
              name="fullName"
              defaultValue={profile?.full_name || ""}
              className="w-full p-3 border border-reny-purple rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input
              name="phone"
              defaultValue={profile?.phone || ""}
              className="w-full p-3 border border-reny-purple rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dirección</label>
            <input
              name="address"
              defaultValue={profile?.address || ""}
              className="w-full p-3 border border-reny-purple rounded-lg"
            />
          </div>
          <button
            formAction={updateProfile}
            className="w-full bg-reny-green hover:bg-reny-green-dark text-white font-bold py-3 rounded-lg transition"
          >
            Guardar cambios
          </button>
        </form>
        <form>
          <button
            formAction={async () => {
              "use server";
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect("/");
            }}
            className="text-red-500 underline"
          >
            Cerrar sesión
          </button>
        </form>
        <Link href="/" className="block text-center text-reny-purple-dark">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}