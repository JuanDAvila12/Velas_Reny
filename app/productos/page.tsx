import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre (A-Z)" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function buildHref(params: {
  categoria?: string;
  aroma?: string;
  orden?: string;
  pagina?: number;
}): string {
  const qs = new URLSearchParams();
  if (params.categoria) qs.set("categoria", params.categoria);
  if (params.aroma) qs.set("aroma", params.aroma);
  if (params.orden && params.orden !== "recientes") qs.set("orden", params.orden);
  if (params.pagina && params.pagina > 1)
    qs.set("pagina", String(params.pagina));
  const str = qs.toString();
  return str ? `/productos?${str}` : "/productos";
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    aroma?: string;
    orden?: string;
    pagina?: string;
  }>;
}) {
  const { categoria, aroma, orden, pagina } = await searchParams;

  const ordenRaw = (orden ?? "recientes") as string;
  const ordenValue: SortValue = SORT_OPTIONS.some((o) => o.value === ordenRaw)
    ? (ordenRaw as SortValue)
    : "recientes";

  const paginaRaw = Number(pagina);
  const currentPage =
    Number.isInteger(paginaRaw) && paginaRaw > 0 ? paginaRaw : 1;

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

  let query = supabase
    .from("products")
    .select("*, category:categories(name)", { count: "exact" });

  if (categoria) {
    const catId = Number(categoria);
    if (!Number.isNaN(catId)) query = query.eq("category_id", catId);
  }
  if (aroma) {
    query = query.eq("aroma", aroma);
  }

  if (ordenValue === "precio_asc") {
    query = query.order("price", { ascending: true });
  } else if (ordenValue === "precio_desc") {
    query = query.order("price", { ascending: false });
  } else if (ordenValue === "nombre") {
    query = query.order("name", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const { data: products, count } = await query.range(
    from,
    from + PAGE_SIZE - 1
  );

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const filterForm = (
    <form method="GET" className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Categoría</label>
        <select
          name="categoria"
          defaultValue={categoria ?? ""}
          className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
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
          className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
        >
          <option value="">Todos</option>
          {distinctAromas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Ordenar por</label>
        <select
          name="orden"
          defaultValue={ordenValue}
          className="w-full rounded-lg border border-reni-purple/60 bg-white/70 p-3 focus:outline-none focus:ring-2 focus:ring-reni-pink"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-reni-purple to-reni-pink px-6 py-3 font-bold text-white transition hover:opacity-90"
      >
        Aplicar
      </button>
      {(categoria || aroma || ordenValue !== "recientes") && (
        <Link
          href="/productos"
          className="block rounded-lg px-4 py-2 text-center text-sm text-reni-pink-dark underline"
        >
          Limpiar filtros
        </Link>
      )}
    </form>
  );

  return (
    <div className="min-h-screen px-4 py-12 md:px-6">
      <h1 className="mb-8 animate-fade-up text-center text-4xl font-caveat text-reni-purple-dark">
        Nuestras velas
      </h1>

      <div className="mx-auto max-w-7xl gap-8 lg:grid lg:grid-cols-[240px_1fr]">
        {/* Barra lateral (desktop) */}
        <aside className="glass hidden h-fit rounded-2xl p-5 shadow lg:block">
          <h2 className="mb-4 text-xl font-caveat text-reni-purple-dark">
            Filtros
          </h2>
          {filterForm}
        </aside>

        {/* Filtros colapsables (móvil) */}
        <details className="glass mb-6 rounded-2xl p-4 shadow lg:hidden">
          <summary className="cursor-pointer font-caveat text-xl text-reni-purple-dark">
            Filtros y orden
          </summary>
          <div className="mt-4">{filterForm}</div>
        </details>

        <div>
          <p className="mb-4 text-sm text-gray-500">
            {count ?? 0} producto{(count ?? 0) === 1 ? "" : "s"}
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              {currentPage > 1 ? (
                <Link
                  href={buildHref({
                    categoria,
                    aroma,
                    orden: ordenValue,
                    pagina: currentPage - 1,
                  })}
                  className="rounded-lg bg-white/80 px-4 py-2 text-sm font-semibold text-reni-purple-dark shadow transition hover:bg-white"
                >
                  ← Anterior
                </Link>
              ) : (
                <span className="rounded-lg bg-white/40 px-4 py-2 text-sm font-semibold text-gray-400">
                  ← Anterior
                </span>
              )}

              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={buildHref({
                    categoria,
                    aroma,
                    orden: ordenValue,
                    pagina: currentPage + 1,
                  })}
                  className="rounded-lg bg-white/80 px-4 py-2 text-sm font-semibold text-reni-purple-dark shadow transition hover:bg-white"
                >
                  Siguiente →
                </Link>
              ) : (
                <span className="rounded-lg bg-white/40 px-4 py-2 text-sm font-semibold text-gray-400">
                  Siguiente →
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
