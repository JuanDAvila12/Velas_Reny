import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";
import AdminDashboard from "@/components/AdminDashboard";
import type { ProductSummary } from "@/lib/types";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, image_url, is_featured, category:categories(name)"
    )
    .order("created_at", { ascending: false })
    .returns<ProductSummary[]>();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="animate-fade-up text-center text-4xl font-caveat text-reny-purple-dark">
          Panel de administración
        </h1>

        <AdminDashboard
          categories={categories ?? []}
          stats={{ products: productCount ?? 0, categories: categoryCount ?? 0 }}
        />

        <div className="glass rounded-2xl p-6 shadow-xl">
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
