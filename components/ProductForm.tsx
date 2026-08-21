"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { saveProduct, type AdminActionState } from "@/app/admin/actions";
import type { AdminProduct } from "@/lib/types";

const initialState: AdminActionState = {};

const inputClass =
  "w-full p-3 border border-reni-purple rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-reni-pink";

const labelClass =
  "block w-full md:w-48 shrink-0 text-sm font-medium text-gray-700 text-left md:text-right";

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

  useEffect(() => {
    if (state?.success) {
      setPreview(null);
      if (!isEditing) {
        formRef.current?.reset();
      }
      onSaved?.();
    }
  }, [state, isEditing, onSaved]);

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
    <form ref={formRef} action={formAction} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={product!.id} />}
      {isEditing && (
        <input
          type="hidden"
          name="current_image_url"
          value={product!.image_url ?? ""}
        />
      )}

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {state.success}
        </div>
      )}

      {/* Nombre */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="name" className={labelClass}>
          Nombre *
        </label>
        <div className="flex-1">
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className={inputClass}
            placeholder="Vela de vainilla"
          />
        </div>
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="slug" className={labelClass}>
          Slug (URL) — opcional
        </label>
        <div className="flex-1">
          <input
            id="slug"
            name="slug"
            defaultValue={product?.slug ?? ""}
            className={inputClass}
            placeholder="vela-de-vainilla"
          />
        </div>
      </div>

      {/* Descripción (ocupa todo el ancho) */}
      <div>
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

      {/* Precio */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="price" className={labelClass}>
          Precio (MXN)
        </label>
        <div className="flex-1">
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
        </div>
      </div>

      {/* Stock */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="stock" className={labelClass}>
          Stock
        </label>
        <div className="flex-1">
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
        </div>
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="category_id" className={labelClass}>
          Categoría
        </label>
        <div className="flex-1">
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
        </div>
      </div>

      {/* Aroma */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="aroma" className={labelClass}>
          Aroma
        </label>
        <div className="flex-1">
          <input
            id="aroma"
            name="aroma"
            defaultValue={product?.aroma ?? ""}
            className={inputClass}
            placeholder="Vainilla, lavanda..."
          />
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="color" className={labelClass}>
          Color
        </label>
        <div className="flex-1">
          <input
            id="color"
            name="color"
            defaultValue={product?.color ?? ""}
            className={inputClass}
            placeholder="Rosa pastel"
          />
        </div>
      </div>

      {/* Tamaño */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="tamano" className={labelClass}>
          Tamaño
        </label>
        <div className="flex-1">
          <input
            id="tamano"
            name="tamano"
            defaultValue={product?.tamano ?? ""}
            className={inputClass}
            placeholder="8 oz"
          />
        </div>
      </div>

      {/* Intensidad */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <label htmlFor="intensidad" className={labelClass}>
          Intensidad
        </label>
        <div className="flex-1">
          <input
            id="intensidad"
            name="intensidad"
            defaultValue={product?.intensidad ?? ""}
            className={inputClass}
            placeholder="Suave, media, intensa"
          />
        </div>
      </div>

      {/* Destacado */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <span className={labelClass}>Destacado</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <input
              id="is_featured"
              name="is_featured"
              type="checkbox"
              defaultChecked={product?.is_featured ?? false}
              className="h-4 w-4 accent-reni-purple"
            />
            <label htmlFor="is_featured" className="text-sm text-gray-700">
              Destacar en la página de inicio
            </label>
          </div>
        </div>
      </div>

      {/* Imagen */}
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:gap-4">
        <span className={labelClass}>Imagen</span>
        <div className="flex-1">
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-reni-purple file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-reni-purple-dark"
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
      </div>

      {/* Botón */}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-reni-purple py-3 font-bold text-white transition hover:bg-reni-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
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