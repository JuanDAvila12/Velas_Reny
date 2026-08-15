import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; aroma?: string }>;
}) {
  const { categoria, aroma } = await searchParams;

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const { data: aromas } = await supabase
    .from("products")
    .select("aroma")
    .not("aroma", "is", null);

  const distinctAromas = Array.from(
    new Set((aromas ?? []).map((p) => p.aroma as string).filter(Boolean))
  ).sort();

  let query = supabase.from("products").select("*, category:categories(name)");

  if (categoria) {
    const catId = Number(categoria);
    if (!Number.isNaN(catId)) query = query.eq("category_id", catId);
  }
  if (aroma) {
    query = query.eq("aroma", aroma);
  }

  const { data: products } = await query.order("created_at", {
    ascending: false,
  });

  return (
    <div className="min-h-screen px-4 py-12">
      <h1 className="mb-8 animate-fade-up text-center text-4xl font-caveat text-reny-purple-dark">
        Nuestras velas
      </h1>

      <form
        method="GET"
        className="glass mx-auto mb-8 flex max-w-3xl flex-wrap items-end justify-center gap-4 rounded-2xl p-5 shadow"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
          <select
            name="categoria"
            defaultValue={categoria ?? ""}
            className="rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
          >
            <option value="">Todas</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Aroma</label>
          <select
            name="aroma"
            defaultValue={aroma ?? ""}
            className="rounded-lg border border-reny-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reny-pink"
          >
            <option value="">Todos</option>
            {distinctAromas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-reny-purple to-reny-pink px-6 py-3 font-bold text-white transition hover:opacity-90"
        >
          Filtrar
        </button>
        {(categoria || aroma) && (
          <Link
            href="/productos"
            className="rounded-lg px-4 py-3 text-sm text-reny-pink-dark underline"
          >
            Limpiar filtros
          </Link>
        )}
      </form>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products && products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No se encontraron productos con esos filtros.
          </p>
        )}
      </div>
    </div>
  );
}
