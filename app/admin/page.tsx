import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";
import AdminPanel from "@/components/AdminPanel";
import type { ProductSummary } from "@/lib/types";

export default async function AdminPage() {
  // Defensa en profundidad: aunque el proxy ya protege /admin,
  // volvemos a verificar el rol en el servidor.
  if (!(await isAdmin())) {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, image_url, is_featured, category:categories(name)"
    )
    .order("created_at", { ascending: false })
    .returns<ProductSummary[]>();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="mb-6 text-3xl font-caveat text-reny-purple-dark">
            Panel de administración
          </h1>
          <AdminPanel categories={categories ?? []} />
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-caveat text-reny-purple-dark">
            Productos existentes ({products?.length ?? 0})
          </h2>
          {products && products.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-3">
                  <img
                    src={p.image_url || "/placeholder-vela.jpg"}
                    alt={p.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.category?.name ?? "Sin categoría"}
                      {p.is_featured ? " · Destacado" : ""}
                    </p>
                  </div>
                  <p className="font-bold text-reny-pink-dark">
                    ${p.price ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Aún no hay productos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
