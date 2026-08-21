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

    // Solo se edita el propio perfil (RLS refuerza auth.uid() = id).
    // Usamos update + fallback a insert (evita el gotcha de upsert + RLS,
    // que exige políticas de INSERT y UPDATE a la vez).
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, address })
      .eq("id", user.id)
      .select("id");

    if (error) {
      console.error("Error al actualizar el perfil:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return redirect("/perfil?error=update_failed");
    }

    // Caso extremo: el perfil no existía (el trigger no corrió al registrarse).
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        phone,
        address,
      });

      if (insertError) {
        console.error("Error al crear el perfil:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });
        return redirect("/perfil?error=update_failed");
      }
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
        <h1 className="font-caveat text-3xl text-reni-purple-dark">Mi perfil</h1>

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
              className="w-full rounded-lg border border-reni-purple p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input
              name="phone"
              defaultValue={profile?.phone || ""}
              className="w-full rounded-lg border border-reni-purple p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dirección</label>
            <input
              name="address"
              defaultValue={profile?.address || ""}
              className="w-full rounded-lg border border-reni-purple p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
            />
          </div>
          <button
            type="submit"
            formAction={updateProfile}
            className="w-full rounded-lg bg-reni-green py-3 font-bold text-white transition hover:bg-reni-green-dark"
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

        <Link href="/" className="block text-center text-reni-purple-dark">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
