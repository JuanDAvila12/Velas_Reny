import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";
import AdminDashboard from "@/components/AdminDashboard";
import type {
  InventoryProduct,
  MovementRow,
  PosProduct,
  ProductSummary,
  StockMovementType,
} from "@/lib/types";

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

  // ---- Inventario: stock actual por producto ----
  const { data: inventoryProducts } = await supabase
    .from("products")
    .select("id, name, stock, category:categories(name)")
    .order("name")
    .returns<InventoryProduct[]>();

  // ---- Punto de venta: productos ligeros (id, nombre, precio, stock) ----
  const { data: posProducts } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .order("name")
    .returns<PosProduct[]>();

  // ---- Inventario: últimos movimientos ----
  const { data: movements } = await supabase
    .from("stock_movements")
    .select(
      "id, product_id, movement_type, quantity, note, created_by, created_at, product:products(name)"
    )
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<
      Array<{
        id: number;
        product_id: number;
        movement_type: StockMovementType;
        quantity: number;
        note: string | null;
        created_by: string | null;
        created_at: string;
        product: { name: string } | null;
      }>
    >();

  // Mapa id -> nombre de usuario para mostrar quién registró cada movimiento.
  const userIds = Array.from(
    new Set((movements ?? []).map((m) => m.created_by).filter(Boolean))
  ) as string[];

  let userNameMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    userNameMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p.full_name ?? "—"])
    );
  }

  const movementRows: MovementRow[] = (movements ?? []).map((m) => ({
    id: m.id,
    product_name: m.product?.name ?? `Producto #${m.product_id}`,
    movement_type: m.movement_type,
    quantity: m.quantity,
    note: m.note,
    creator_name: m.created_by ? userNameMap[m.created_by] ?? "—" : "—",
    created_at: m.created_at,
  }));

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="animate-fade-up text-center text-4xl font-caveat text-reny-purple-dark">
          Panel de administración
        </h1>

        <AdminDashboard
          categories={categories ?? []}
          stats={{ products: productCount ?? 0, categories: categoryCount ?? 0 }}
          products={inventoryProducts ?? []}
          movements={movementRows}
          posProducts={posProducts ?? []}
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
