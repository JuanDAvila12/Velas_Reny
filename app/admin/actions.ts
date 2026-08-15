"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";

export type AdminActionState = {
  error?: string;
  success?: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  // 1) Autorización: solo administradores.
  if (!(await isAdmin())) {
    return { error: "No tienes permisos de administrador." };
  }

  const supabase = await createClient();

  // 2) Lectura y saneado de campos.
  const name = (formData.get("name") as string)?.trim();
  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugInput || slugify(name);
  const description = (formData.get("description") as string)?.trim() || null;
  const priceRaw = (formData.get("price") as string)?.trim();
  const stockRaw = (formData.get("stock") as string)?.trim();
  const categoryIdRaw = (formData.get("category_id") as string)?.trim();
  const aroma = (formData.get("aroma") as string)?.trim() || null;
  const color = (formData.get("color") as string)?.trim() || null;
  const tamano = (formData.get("tamano") as string)?.trim() || null;
  const intensidad = (formData.get("intensidad") as string)?.trim() || null;
  const isFeatured = formData.get("is_featured") === "on";
  const image = formData.get("image") as File | null;

  // 3) Validación de tipos y reglas de negocio.
  if (!name) return { error: "El nombre es obligatorio." };
  if (name.length < 3) {
    return { error: "El nombre debe tener al menos 3 caracteres." };
  }
  if (!slug) return { error: "No se pudo generar un slug válido." };

  const price = priceRaw ? Number(priceRaw) : null;
  if (priceRaw && (Number.isNaN(price) || price! < 0)) {
    return { error: "El precio debe ser un número mayor o igual a 0." };
  }

  const stock = stockRaw ? Number(stockRaw) : 0;
  if (stockRaw && (!Number.isInteger(stock) || stock < 0)) {
    return { error: "El stock debe ser un número entero mayor o igual a 0." };
  }

  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;

  // 4) Validar que el slug no esté en uso.
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { error: "Ya existe un producto con ese slug. Usa otro." };
  }

  // 5) Subida de imagen a Supabase Storage (bucket "product-images").
  let imageUrl: string | null = null;

  if (image && image.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return { error: "Formato de imagen no válido. Usa JPG, PNG o WebP." };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { error: "La imagen no puede superar los 5 MB." };
    }

    const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, image, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      return { error: `Error al subir la imagen: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);
    imageUrl = publicUrlData.publicUrl;
  }

  // 6) Inserción (los parámetros evitan SQL injection).
  const { error: insertError } = await supabase.from("products").insert({
    name,
    slug,
    description,
    price,
    stock,
    category_id: categoryId,
    aroma,
    color,
    tamano,
    intensidad,
    is_featured: isFeatured,
    image_url: imageUrl,
  });

  if (insertError) {
    return { error: `Error al crear el producto: ${insertError.message}` };
  }

  // 7) Revalidar las rutas que muestran productos.
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/admin");

  return { success: "Producto creado correctamente." };
}
