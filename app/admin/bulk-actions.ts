"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";

export type BulkRowResult = {
  row: number;
  name: string;
  status: "ok" | "error";
  message?: string;
};

export type BulkUploadState = {
  error?: string;
  summary?: string;
  inserted?: number;
  failed?: number;
  results?: BulkRowResult[];
};

const MAX_BYTES = 1 * 1024 * 1024; // 1 MB
const CHUNK_SIZE = 50;

const ALIASES: Record<string, string[]> = {
  name: ["name", "nombre"],
  slug: ["slug"],
  description: ["description", "descripcion", "descripción"],
  price: ["price", "precio"],
  stock: ["stock", "existencia", "inventario"],
  category: ["category", "categoria", "categoría", "category_id"],
  aroma: ["aroma"],
  color: ["color"],
  tamano: ["tamano", "tamaño", "size", "talla"],
  intensidad: ["intensidad", "intensity"],
  image_url: ["image_url", "imagen", "image"],
  is_featured: ["is_featured", "destacado", "featured"],
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }

  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);

  return rows;
}

function getField(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v === undefined || v === null) continue;
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
  }
  return undefined;
}

function normalizeRecord(obj: Record<string, unknown>): Record<string, string | undefined> {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) lower[k.toLowerCase()] = v;

  return {
    name: getField(lower, ALIASES.name),
    slug: getField(lower, ALIASES.slug),
    description: getField(lower, ALIASES.description),
    price: getField(lower, ALIASES.price),
    stock: getField(lower, ALIASES.stock),
    category: getField(lower, ALIASES.category),
    aroma: getField(lower, ALIASES.aroma),
    color: getField(lower, ALIASES.color),
    tamano: getField(lower, ALIASES.tamano),
    intensidad: getField(lower, ALIASES.intensidad),
    image_url: getField(lower, ALIASES.image_url),
    is_featured: getField(lower, ALIASES.is_featured),
  };
}

function parseBool(v?: string): boolean {
  if (!v) return false;
  return ["true", "1", "si", "sí", "yes", "x", "on", "verdadero"].includes(
    v.trim().toLowerCase()
  );
}

function uniqueSlug(base: string, used: Set<string>): string {
  const clean = base || "producto";
  if (!used.has(clean)) {
    used.add(clean);
    return clean;
  }
  let i = 2;
  while (used.has(`${clean}-${i}`)) i++;
  const final = `${clean}-${i}`;
  used.add(final);
  return final;
}

export async function bulkUploadProducts(
  _prevState: BulkUploadState,
  formData: FormData
): Promise<BulkUploadState> {
  if (!(await isAdmin())) {
    return { error: "No tienes permisos de administrador." };
  }

  const supabase = await createClient();
  const mode = (formData.get("mode") as string) ?? "csv";

  let records: Record<string, unknown>[] = [];

  try {
    if (mode === "json") {
      const jsonText = (formData.get("jsonText") as string) ?? "";
      if (jsonText.length > MAX_BYTES) {
        return { error: "El JSON supera 1 MB." };
      }
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        return { error: "El JSON debe ser un array de objetos." };
      }
      records = parsed;
    } else {
      const file = formData.get("file") as File | null;
      if (!file || file.size === 0) {
        return { error: "Selecciona un archivo CSV." };
      }
      if (file.size > MAX_BYTES) {
        return { error: "El archivo CSV supera 1 MB." };
      }
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        return {
          error: "El CSV debe tener una fila de encabezado y al menos un producto.",
        };
      }
      const headers = rows[0].map((h) => h.trim().toLowerCase());
      records = rows.slice(1).map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] ?? "";
        });
        return obj;
      });
    }
  } catch (e) {
    return {
      error: `No se pudo leer la entrada: ${
        e instanceof Error ? e.message : "formato inválido"
      }`,
    };
  }

  if (records.length === 0) {
    return { error: "No hay productos para procesar." };
  }

  const [{ data: existingCategories }, { data: existingSlugs }] =
    await Promise.all([
      supabase.from("categories").select("id, name, slug"),
      supabase.from("products").select("slug"),
    ]);

  const catByLower = new Map<string, { id: number; name: string; slug: string }>();
  const catById = new Map<number, { id: number; name: string; slug: string }>();
  for (const c of existingCategories ?? []) {
    catByLower.set(c.name.toLowerCase(), c);
    catById.set(c.id, c);
  }

  const usedSlugs = new Set<string>((existingSlugs ?? []).map((s) => s.slug));

  const results: BulkRowResult[] = [];
  const pending: { row: number; data: Record<string, unknown> }[] = [];

  for (let i = 0; i < records.length; i++) {
    const rowNumber = i + 2;
    const raw = normalizeRecord(records[i]);
    const name = raw.name?.trim();

    if (!name || name.length < 3) {
      results.push({
        row: rowNumber,
        name: name || "(sin nombre)",
        status: "error",
        message: "El nombre es obligatorio (mínimo 3 caracteres).",
      });
      continue;
    }

    let price: number;
    if (raw.price === undefined || raw.price.trim() === "") {
      results.push({ row: rowNumber, name, status: "error", message: "Falta el precio." });
      continue;
    }
    price = Number(raw.price);
    if (Number.isNaN(price) || price < 0) {
      results.push({
        row: rowNumber,
        name,
        status: "error",
        message: "El precio debe ser un número mayor o igual a 0.",
      });
      continue;
    }

    let stock = 0;
    if (raw.stock !== undefined && raw.stock.trim() !== "") {
      stock = Number(raw.stock);
      if (!Number.isInteger(stock) || stock < 0) {
        results.push({
          row: rowNumber,
          name,
          status: "error",
          message: "El stock debe ser un entero mayor o igual a 0.",
        });
        continue;
      }
    }

    let categoryId: number | null = null;
    if (raw.category && raw.category.trim() !== "") {
      const catVal = raw.category.trim();
      if (/^\d+$/.test(catVal)) {
        const id = Number(catVal);
        if (!catById.has(id)) {
          results.push({
            row: rowNumber,
            name,
            status: "error",
            message: `La categoría con id ${id} no existe.`,
          });
          continue;
        }
        categoryId = id;
      } else {
        const lower = catVal.toLowerCase();
        const existing = catByLower.get(lower);
        if (existing) {
          categoryId = existing.id;
        } else {
          const newSlug = uniqueSlug(slugify(catVal), usedSlugs);
          const { data: newCat, error: catErr } = await supabase
            .from("categories")
            .insert({ name: catVal, slug: newSlug })
            .select("id, name, slug")
            .single();
          if (catErr) {
            results.push({
              row: rowNumber,
              name,
              status: "error",
              message: `No se pudo crear la categoría "${catVal}": ${catErr.message}`,
            });
            continue;
          }
          catByLower.set(lower, newCat);
          catById.set(newCat.id, newCat);
          categoryId = newCat.id;
        }
      }
    }

    const slug = uniqueSlug(slugify(raw.slug?.trim() || name), usedSlugs);

    pending.push({
      row: rowNumber,
      data: {
        name,
        slug,
        description: raw.description?.trim() || null,
        price,
        stock,
        category_id: categoryId,
        aroma: raw.aroma?.trim() || null,
        color: raw.color?.trim() || null,
        tamano: raw.tamano?.trim() || null,
        intensidad: raw.intensidad?.trim() || null,
        image_url: raw.image_url?.trim() || null,
        is_featured: parseBool(raw.is_featured),
      },
    });
    results.push({ row: rowNumber, name, status: "ok" });
  }

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i += CHUNK_SIZE) {
    const chunk = pending.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase
      .from("products")
      .insert(chunk.map((p) => p.data));

    if (!error) {
      inserted += chunk.length;
      continue;
    }

    // Fallback fila a fila para identificar el error exacto.
    for (const p of chunk) {
      const { error: singleErr } = await supabase
        .from("products")
        .insert(p.data);
      if (singleErr) {
        failed++;
        const r = results.find((x) => x.row === p.row && x.status === "ok");
        if (r) {
          r.status = "error";
          r.message = singleErr.message;
        }
      } else {
        inserted++;
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/admin");
  revalidatePath("/categorias");

  return {
    inserted,
    failed,
    results,
    summary: `Se procesaron ${results.length} filas: ${inserted} insertadas y ${
      results.length - inserted
    } con error.`,
  };
}

