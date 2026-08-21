import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CategoriasPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen px-4 py-12">
      <h1 className="mb-8 animate-fade-up text-center text-4xl font-caveat text-reni-purple-dark">
        Categorías
      </h1>
      <div className="mx-auto grid max-w-3xl animate-fade-in grid-cols-2 gap-4 sm:grid-cols-3">
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className="glass rounded-xl p-4 text-center shadow transition hover:-translate-y-0.5 hover:bg-white hover:text-reni-purple-dark"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
