"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { saveProduct, type AdminActionState } from "@/app/admin/actions";
import type { AdminProduct } from "@/lib/types";

const initialState: AdminActionState = {};

const inputClass =
  "w-full p-3 border border-reny-purple rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-reny-pink";

const labelClass = "text-left md:text-right text-sm font-medium text-gray-700";

export default function ProductForm({
  categories,
  product,
  onSaved,
}: {
  categories: { id: number; name: string }[];
  product?: AdminProduct | null;
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveProduct,
    initialState
  );
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = Boolean(product);

  // Al guardar con éxito: limpiar vista previa, resetear si es creación y avisar.
  useEffect(() => {
    if (state?.success) {
      setPreview(null);
      if (!isEditing) {
        formRef.current?.reset();
      }
      onSaved?.();
    }
  }, [state, isEditing, onSaved]);

  // Liberar la URL del objeto de vista previa.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr] md:items-center"
    >
      {isEditing && <input type="hidden" name="id" value={product!.id} />}
      {isEditing && (
        <input
          type="hidden"
          name="current_image_url"
          value={product!.image_url ?? ""}
        />
      )}

      {state?.error && (
        <div className="md:col-span-2">
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </p>
        </div>
      )}
      {state?.success && (
        <div className="md:col-span-2">
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {state.success}
          </p>
        </div>
      )}

      <label htmlFor="name" className={labelClass}>
        Nombre *
      </label>
      <input
        id="name"
        name="name"
        required
        defaultValue={product?.name ?? ""}
        className={inputClass}
        placeholder="Vela de vainilla"
      />

      <label htmlFor="slug" className={labelClass}>
        Slug (URL) — opcional
      </label>
      <input
        id="slug"
        name="slug"
        defaultValue={product?.slug ?? ""}
        className={inputClass}
        placeholder="vela-de-vainilla"
      />

      {/* Descripción ocupa toda la fila */}
      <div className="md:col-span-2">
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className={inputClass}
        />
      </div>
      <label htmlFor="price" className={labelClass}>
        Precio (MXN)
      </label>
      <input
        id="price"
        name="price"
        type="number"
        step="0.01"
        min="0"
        defaultValue={product?.price ?? ""}
        className={inputClass}
        placeholder="120.00"
      />

      <label htmlFor="stock" className={labelClass}>
        Stock
      </label>
      <input
        id="stock"
        name="stock"
        type="number"
        step="1"
        min="0"
        defaultValue={product?.stock ?? ""}
        className={inputClass}
        placeholder="10"
      />

      <label htmlFor="category_id" className={labelClass}>
        Categoría
      </label>
      <select
        id="category_id"
        name="category_id"
        defaultValue={
          product?.category_id != null ? String(product.category_id) : ""
        }
        className={inputClass}
      >
        <option value="">Sin categoría</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label htmlFor="aroma" className={labelClass}>
        Aroma
      </label>
      <input
        id="aroma"
        name="aroma"
        defaultValue={product?.aroma ?? ""}
        className={inputClass}
        placeholder="Vainilla, lavanda..."
      />

      <label htmlFor="color" className={labelClass}>
        Color
      </label>
      <input
        id="color"
        name="color"
        defaultValue={product?.color ?? ""}
        className={inputClass}
        placeholder="Rosa pastel"
      />

      <label htmlFor="tamano" className={labelClass}>
        Tamaño
      </label>
      <input
        id="tamano"
        name="tamano"
        defaultValue={product?.tamano ?? ""}
        className={inputClass}
        placeholder="8 oz"
      />

      <label htmlFor="intensidad" className={labelClass}>
        Intensidad
      </label>
      <input
        id="intensidad"
        name="intensidad"
        defaultValue={product?.intensidad ?? ""}
        className={inputClass}
        placeholder="Suave, media, intensa"
      />

      <span className={labelClass}>Destacado</span>
      <div className="flex items-center gap-2">
        <input
          id="is_featured"
          name="is_featured"
          type="checkbox"
          defaultChecked={product?.is_featured ?? false}
          className="h-4 w-4 accent-reny-purple"
        />
        <label htmlFor="is_featured" className="text-sm text-gray-700">
          Destacar en la página de inicio
        </label>
      </div>

      <span className={labelClass}>Imagen</span>
      <div>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-reny-purple file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-reny-purple-dark"
        />
        {preview ? (
          <img
            src={preview}
            alt="Vista previa del producto"
            className="mt-3 h-48 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain"
          />
        ) : isEditing && product?.image_url ? (
          <div className="mt-3">
            <p className="mb-1 text-xs text-gray-500">
              Imagen actual (se conserva si no subes una nueva):
            </p>
            <img
              src={product.image_url}
              alt={`Imagen actual de ${product.name}`}
              className="h-48 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain"
            />
          </div>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-reny-purple py-3 font-bold text-white transition hover:bg-reny-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? isEditing
              ? "Actualizando producto..."
              : "Creando producto..."
            : isEditing
              ? "Actualizar producto"
              : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
