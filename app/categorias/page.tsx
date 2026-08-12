import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CategoriasPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen bg-reny-cream py-12 px-4">
      <h1 className="text-4xl font-caveat text-reny-purple-dark text-center mb-8">
        Categorías
      </h1>
      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className="bg-white p-4 rounded-xl shadow text-center hover:bg-reny-purple hover:text-white transition"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
