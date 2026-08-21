"use client";

import { useActionState, useState } from "react";
import {
  bulkUploadProducts,
  type BulkUploadState,
} from "@/app/admin/bulk-actions";

const initialState: BulkUploadState = {};

const inputClass =
  "w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink";

export default function BulkUpload() {
  const [state, formAction, pending] = useActionState(
    bulkUploadProducts,
    initialState
  );
  const [mode, setMode] = useState<"csv" | "json">("csv");

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        Carga varios productos a la vez desde un archivo CSV o pegando un JSON.
        Máximo 1 MB. El nombre y el precio son obligatorios; la categoría se
        crea automáticamente si no existe.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("csv")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "csv"
              ? "bg-reni-purple text-white"
              : "bg-white/70 text-gray-600 hover:bg-white"
          }`}
        >
          Archivo CSV
        </button>
        <button
          type="button"
          onClick={() => setMode("json")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "json"
              ? "bg-reni-purple text-white"
              : "bg-white/70 text-gray-600 hover:bg-white"
          }`}
        >
          Pegar JSON
        </button>
        <a
          href="/bulk-template.csv"
          download
          className="ml-auto self-center text-sm font-medium text-reni-pink-dark underline"
        >
          Descargar plantilla CSV
        </a>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value={mode} />

        {mode === "csv" ? (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Archivo CSV (.csv)
            </label>
            <input
              name="file"
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-reni-purple file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-reni-purple-dark"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Array de objetos JSON
            </label>
            <textarea
              name="jsonText"
              rows={10}
              placeholder={`[
  { "name": "Vela de Vainilla", "price": 120, "stock": 10, "category": "Aromáticas", "aroma": "Vainilla" }
]`}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        )}

        {state?.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state?.summary && (
          <p
            className={`rounded-lg border p-3 text-sm ${
              state.failed && state.failed > 0
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {state.summary}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gradient-to-r from-reni-purple to-reni-pink py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Procesando..." : "Cargar productos"}
        </button>
      </form>

      {state?.results && state.results.length > 0 && (
        <div className="mt-6 max-h-96 overflow-y-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/90">
              <tr className="border-b">
                <th className="px-3 py-2 text-left">Fila</th>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {state.results.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2 text-gray-500">{r.row}</td>
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2">
                    {r.status === "ok" ? (
                      <span className="text-green-600">✓ Insertado</span>
                    ) : (
                      <span className="text-red-600">✗ Error</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {r.message ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
