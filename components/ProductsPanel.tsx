"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminProduct } from "@/lib/types";

const PAGE_SIZE = 20;

export default function ProductsPanel({
  products,
  onEdit,
}: {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-caveat text-reni-purple-dark">
          Productos ({filtered.length})
        </h3>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o slug..."
          className="w-full max-w-xs rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-white/80">
            <tr className="border-b text-left">
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2 text-right">Precio</th>
              <th className="px-4 py-2 text-right">Stock</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length > 0 ? (
              pageItems.map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-white/50"
                >
                  <td className="px-4 py-2">
                    <img
                      src={p.image_url || "/placeholder-vela.jpg"}
                      alt={p.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-reni-pink-dark">
                    ${p.price ?? "—"}
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
                  <td className="px-4 py-2 text-gray-500">
                    {p.category?.name ?? "Sin categoría"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="rounded-lg bg-reni-purple px-3 py-1.5 text-xs font-bold text-white transition hover:bg-reni-purple-dark"
                      >
                        Editar
                      </button>
                      <a
                        href={`/productos/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-white"
                      >
                        Ver
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Sin resultados para esa búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="rounded-lg bg-white/70 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <p className="text-sm text-gray-500">
            Página {currentPage + 1} de {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="rounded-lg bg-white/70 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
