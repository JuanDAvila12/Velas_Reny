import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

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

    if (!user) redirect("/login");

    const fullName = (formData.get("fullName") as string)?.trim() || "";
    const phone = (formData.get("phone") as string)?.trim() || null;
    const address = (formData.get("address") as string)?.trim() || null;

    if (!fullName) {
      return redirect("/perfil?error=name_required");
    }

    // RLS garantiza que solo se edite el propio perfil (id = user.id).
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      phone,
      address,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return redirect("/perfil?error=update_failed");
    }

    revalidatePath("/perfil");
    return redirect("/perfil?success=updated");
  }

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="font-caveat text-3xl text-reny-purple-dark">Mi perfil</h1>

        {success === "updated" && (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Perfil actualizado correctamente.
          </p>
        )}
        {error === "name_required" && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            El nombre completo es obligatorio.
          </p>
        )}
        {error === "update_failed" && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            No se pudo actualizar el perfil. Inténtalo de nuevo.
          </p>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre completo</label>
            <input
              name="fullName"
              defaultValue={profile?.full_name || ""}
              className="w-full rounded-lg border border-reny-purple p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input
              name="phone"
              defaultValue={profile?.phone || ""}
              className="w-full rounded-lg border border-reny-purple p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dirección</label>
            <input
              name="address"
              defaultValue={profile?.address || ""}
              className="w-full rounded-lg border border-reny-purple p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
            />
          </div>
          <button
            type="submit"
            formAction={updateProfile}
            className="w-full rounded-lg bg-reny-green py-3 font-bold text-white transition hover:bg-reny-green-dark"
          >
            Guardar cambios
          </button>
        </form>

        <form>
          <button
            type="submit"
            formAction={signOut}
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
