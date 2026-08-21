import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";
import AdminDashboard from "@/components/AdminDashboard";
import type {
  AdminProduct,
  InventoryProduct,
  MovementRow,
  PosProduct,
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

  const { data: adminProducts } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, stock, category_id, aroma, color, tamano, intensidad, image_url, is_featured, created_at, category:categories(name)"
    )
    .order("created_at", { ascending: false })
    .returns<AdminProduct[]>();

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
        <h1 className="animate-fade-up text-center text-4xl font-caveat text-reni-purple-dark">
          Panel de administración
        </h1>

        <AdminDashboard
          categories={categories ?? []}
          stats={{ products: productCount ?? 0, categories: categoryCount ?? 0 }}
          products={inventoryProducts ?? []}
          adminProducts={adminProducts ?? []}
          movements={movementRows}
          posProducts={posProducts ?? []}
        />

      </div>
    </div>
  );
}
