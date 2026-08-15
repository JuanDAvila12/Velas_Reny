"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createProduct, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = {};

const inputClass =
  "w-full p-3 border border-reny-purple rounded-lg focus:outline-none focus:ring-2 focus:ring-reny-pink";

export default function AdminPanel({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createProduct,
    initialState
  );
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpiar el formulario al crear un producto con éxito.
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setPreview(null);
    }
  }, [state]);

  // Liberar la URL del objeto de vista previa.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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

      <div>
        <label className="mb-1 block text-sm font-medium">Nombre *</label>
        <input
          name="name"
          required
          className={inputClass}
          placeholder="Vela de vainilla"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Slug (URL) — opcional
        </label>
        <input
          name="slug"
          className={inputClass}
          placeholder="vela-de-vainilla"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea name="description" rows={3} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Precio (MXN)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            placeholder="120.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stock</label>
          <input
            name="stock"
            type="number"
            step="1"
            min="0"
            className={inputClass}
            placeholder="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
          <select name="category_id" className={inputClass} defaultValue="">
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Aroma</label>
          <input
            name="aroma"
            className={inputClass}
            placeholder="Vainilla, lavanda..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Color</label>
          <input
            name="color"
            className={inputClass}
            placeholder="Rosa pastel"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tamaño</label>
          <input name="tamano" className={inputClass} placeholder="8 oz" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Intensidad</label>
        <input
          name="intensidad"
          className={inputClass}
          placeholder="Suave, media, intensa"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input name="is_featured" type="checkbox" className="h-4 w-4" />
        Destacar en la página de inicio
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Imagen del producto
        </label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-reny-purple file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-reny-purple-dark"
        />
        {preview && (
          <img
            src={preview}
            alt="Vista previa del producto"
            className="mt-3 h-48 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-reny-purple py-3 font-bold text-white transition hover:bg-reny-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creando producto..." : "Crear producto"}
      </button>
    </form>
  );
}
