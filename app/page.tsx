import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("is_featured", true)
    .limit(6);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen">
      {/* Hero con gradiente animado */}
      <section className="animate-gradient-x relative overflow-hidden bg-gradient-to-r from-reny-purple/40 via-reny-pink/30 to-reny-green/30 py-24 text-center">
        <div className="relative mx-auto max-w-3xl animate-fade-up px-4">
          <h1 className="text-6xl font-caveat text-reny-purple-dark drop-shadow-lg sm:text-7xl">
            Velas Reny
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Ilumina tus momentos especiales con nuestras velas artesanales
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/productos"
              className="rounded-full bg-gradient-to-r from-reny-purple to-reny-pink px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="rounded-full border border-reny-purple-dark bg-white/60 px-8 py-3 font-bold text-reny-purple-dark transition hover:-translate-y-0.5 hover:bg-white"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-center text-3xl font-caveat text-reny-purple-dark">
          Categorías
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="glass rounded-full px-4 py-2 shadow transition hover:bg-white hover:text-reny-pink-dark"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-center text-3xl font-caveat text-reny-purple-dark">
          Destacados
        </h2>
        {featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Pronto tendremos productos destacados.{" "}
            <Link
              href="/productos"
              className="text-reny-pink-dark underline"
            >
              Ver catálogo
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
