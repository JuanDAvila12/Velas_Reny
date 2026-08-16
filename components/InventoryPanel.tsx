"use client";

import { useActionState, useMemo, useState } from "react";
import {
  registerMovement,
  type InventoryActionState,
} from "@/app/admin/inventory-actions";
import type {
  InventoryProduct,
  MovementRow,
  StockMovementType,
} from "@/lib/types";

const initialState: InventoryActionState = {};

const inputClass =
  "w-full rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink";

const TYPE_LABELS: Record<StockMovementType, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
  ajuste_inicial: "Ajuste inicial",
};

const TYPE_STYLES: Record<StockMovementType, string> = {
  entrada: "bg-green-100 text-green-700",
  salida: "bg-red-100 text-red-700",
  ajuste: "bg-amber-100 text-amber-700",
  ajuste_inicial: "bg-reny-purple/20 text-reny-purple-dark",
};

function quantityPresentation(type: StockMovementType) {
  if (type === "salida") return { prefix: "-", color: "text-red-500" };
  if (type === "entrada") return { prefix: "+", color: "text-green-600" };
  return { prefix: "", color: "text-amber-600" };
}

export default function InventoryPanel({
  products,
  movements,
}: {
  products: InventoryProduct[];
  movements: MovementRow[];
}) {
  const [state, formAction, pending] = useActionState(
    registerMovement,
    initialState
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.name ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="animate-fade-in space-y-10">
      {/* Formulario de movimiento */}
      <form action={formAction} className="space-y-4">
        <h3 className="text-2xl font-caveat text-reny-purple-dark">
          Registrar movimiento
        </h3>

        {state?.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {state.success}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Producto *</label>
            <select
              name="product_id"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>
                Selecciona un producto
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tipo de movimiento *
            </label>
            <select
              name="movement_type"
              required
              defaultValue="entrada"
              className={inputClass}
            >
              <option value="entrada">Entrada (suma stock)</option>
              <option value="salida">Salida (resta stock)</option>
              <option value="ajuste">Ajuste (stock absoluto)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Cantidad *</label>
            <input
              name="quantity"
              type="number"
              step="1"
              min="1"
              required
              className={inputClass}
              placeholder="10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nota (opcional)
            </label>
            <input
              name="note"
              className={inputClass}
              placeholder="Compra a proveedor, merma, etc."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gradient-to-r from-reny-purple to-reny-pink py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Registrando..." : "Registrar movimiento"}
        </button>
      </form>

      {/* Stock actual */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-2xl font-caveat text-reny-purple-dark">
            Stock actual ({products.length})
          </h3>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o categoría..."
            className={`${inputClass} max-w-xs`}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-white/80">
              <tr className="border-b text-left">
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Categoría</th>
                <th className="px-4 py-2 text-right">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {p.category?.name ?? "Sin categoría"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={
                          p.stock > 0
                            ? "font-bold text-green-600"
                            : "font-bold text-red-500"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Sin resultados para esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimos movimientos */}
      <div>
        <h3 className="mb-3 text-2xl font-caveat text-reny-purple-dark">
          Últimos movimientos ({movements.length})
        </h3>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-white/80">
              <tr className="border-b text-left">
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2 text-right">Cantidad</th>
                <th className="px-4 py-2">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movements.length > 0 ? (
                movements.map((m) => {
                  const q = quantityPresentation(m.movement_type);
                  return (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="whitespace-nowrap px-4 py-2 text-gray-500">
                        {new Date(m.created_at).toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-2 font-medium">{m.product_name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            TYPE_STYLES[m.movement_type]
                          }`}
                        >
                          {TYPE_LABELS[m.movement_type]}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2 text-right font-bold ${q.color}`}
                      >
                        {q.prefix}
                        {m.quantity}
                      </td>
                      <td className="px-4 py-2 text-gray-500">
                        {m.creator_name}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Aún no hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
