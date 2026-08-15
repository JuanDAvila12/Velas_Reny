import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("is_featured", true)
    .limit(4);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-reny-purple/30 py-20 text-center">
        <h1 className="text-5xl font-caveat text-reny-purple-dark">
          Velas Reny
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Ilumina tus momentos especiales con nuestras velas artesanales
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-block rounded-full bg-reny-pink px-6 py-3 font-bold text-white transition hover:bg-reny-pink-dark"
        >
          Ver catálogo
        </Link>
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
              className="rounded-full bg-white px-4 py-2 shadow transition hover:bg-reny-pink hover:text-white"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
