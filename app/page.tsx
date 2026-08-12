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

  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <div className="bg-reny-cream min-h-screen">
      {/* Hero */}
      <section className="relative bg-reny-purple/30 py-20 text-center">
        <h1 className="text-5xl font-caveat text-reny-purple-dark">
          Velas Reny
        </h1>
        <p className="text-lg text-gray-700 mt-4">
          Ilumina tus momentos especiales con nuestras velas artesanales
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-block bg-reny-pink hover:bg-reny-pink-dark text-white font-bold py-3 px-6 rounded-full"
        >
          Ver catálogo
        </Link>
      </section>

      {/* Categorías */}
      <section className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-caveat text-reny-purple-dark mb-6 text-center">
          Categorías
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="bg-white px-4 py-2 rounded-full shadow hover:bg-reny-pink hover:text-white transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-caveat text-reny-purple-dark mb-6 text-center">
          Destacados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}