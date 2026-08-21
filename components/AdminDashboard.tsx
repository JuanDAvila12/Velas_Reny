"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "./AdminPanel";
import BulkUpload from "./BulkUpload";
import InventoryPanel from "./InventoryPanel";
import POSPanel from "./POSPanel";
import ProductsPanel from "./ProductsPanel";
import type {
  AdminProduct,
  InventoryProduct,
  MovementRow,
  PosProduct,
} from "@/lib/types";

type Tab = "single" | "products" | "bulk" | "inventory" | "pos";

export default function AdminDashboard({
  categories,
  stats,
  products,
  adminProducts,
  movements,
  posProducts,
}: {
  categories: { id: number; name: string }[];
  stats: { products: number; categories: number };
  products: InventoryProduct[];
  adminProducts: AdminProduct[];
  movements: MovementRow[];
  posProducts: PosProduct[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("single");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );

  const handleSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  function handleEdit(product: AdminProduct) {
    setEditingProduct(product);
    setTab("single");
  }

  function handleCancelEdit() {
    setEditingProduct(null);
    setTab("products");
  }

  return (
    <div className="space-y-8">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 text-center shadow-sm">
          <p className="text-4xl font-bold text-reni-purple-dark">
            {stats.products}
          </p>
          <p className="text-sm text-gray-500">Productos</p>
        </div>
        <div className="glass rounded-2xl p-6 text-center shadow-sm">
          <p className="text-4xl font-bold text-reni-purple-dark">
            {stats.categories}
          </p>
          <p className="text-sm text-gray-500">Categorías</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl p-4 shadow-xl sm:p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("single")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "single"
                ? "bg-gradient-to-r from-reni-purple to-reni-pink text-white shadow"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Agregar producto
          </button>
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "products"
                ? "bg-gradient-to-r from-reni-purple to-reni-pink text-white shadow"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Productos
          </button>
          <button
            type="button"
            onClick={() => setTab("bulk")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "bulk"
                ? "bg-gradient-to-r from-reni-purple to-reni-pink text-white shadow"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Carga masiva
          </button>
          <button
            type="button"
            onClick={() => setTab("inventory")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "inventory"
                ? "bg-gradient-to-r from-reni-purple to-reni-pink text-white shadow"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Inventario
          </button>
          <button
            type="button"
            onClick={() => setTab("pos")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "pos"
                ? "bg-gradient-to-r from-reni-purple to-reni-pink text-white shadow"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Punto de venta
          </button>
        </div>

        {tab === "single" ? (
          <AdminPanel
            categories={categories}
            product={editingProduct}
            onSaved={handleSaved}
            onCancelEdit={handleCancelEdit}
          />
        ) : tab === "products" ? (
          <ProductsPanel products={adminProducts} onEdit={handleEdit} />
        ) : tab === "bulk" ? (
          <BulkUpload />
        ) : tab === "inventory" ? (
          <InventoryPanel products={products} movements={movements} />
        ) : (
          <POSPanel products={posProducts} />
        )}
      </div>
    </div>
  );
}
