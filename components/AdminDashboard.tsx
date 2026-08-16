"use client";

import { useState } from "react";
import AdminPanel from "./AdminPanel";
import BulkUpload from "./BulkUpload";
import InventoryPanel from "./InventoryPanel";
import type { InventoryProduct, MovementRow } from "@/lib/types";

export default function AdminDashboard({
  categories,
  stats,
  products,
  movements,
}: {
  categories: { id: number; name: string }[];
  stats: { products: number; categories: number };
  products: InventoryProduct[];
  movements: MovementRow[];
}) {
  const [tab, setTab] = useState<"single" | "bulk" | "inventory">("single");

  return (
    <div className="space-y-8">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 text-center shadow-sm">
          <p className="text-4xl font-bold text-reny-purple-dark">
            {stats.products}
          </p>
          <p className="text-sm text-gray-500">Productos</p>
        </div>
        <div className="glass rounded-2xl p-6 text-center shadow-sm">
          <p className="text-4xl font-bold text-reny-purple-dark">
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
                ? "bg-gradient-to-r from-reny-purple to-reny-pink text-white shadow"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Agregar producto
          </button>
          <button
            type="button"
            onClick={() => setTab("bulk")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "bulk"
                ? "bg-gradient-to-r from-reny-purple to-reny-pink text-white shadow"
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
                ? "bg-gradient-to-r from-reny-purple to-reny-pink text-white shadow"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Inventario
          </button>
        </div>

        {tab === "single" ? (
          <AdminPanel categories={categories} />
        ) : tab === "bulk" ? (
          <BulkUpload />
        ) : (
          <InventoryPanel products={products} movements={movements} />
        )}
      </div>
    </div>
  );
}
