import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const gallery = [product.image_url, ...(product.images ?? [])].filter(
    Boolean
  ) as string[];

  const details = [
    ["Aroma", product.aroma],
    ["Color", product.color],
    ["Tamaño", product.tamano],
    ["Intensidad", product.intensidad],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="min-h-screen animate-fade-in px-4 py-12">
      <div className="glass mx-auto grid max-w-5xl gap-8 rounded-2xl p-8 shadow-xl md:grid-cols-2">
        <div>
          <img
            src={gallery[0] || "/placeholder-vela.jpg"}
            alt={product.name}
            className="h-80 w-full rounded-xl object-cover shadow"
          />
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((g, i) => (
                <img
                  key={i}
                  src={g}
                  alt={`${product.name} ${i + 1}`}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover opacity-70 transition hover:opacity-100"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-caveat text-reny-purple-dark">
            {product.name}
          </h1>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-gradient text-3xl font-bold">
            ${product.price ?? "—"}
          </p>
          {product.stock != null && (
            <p
              className={`text-sm font-medium ${
                product.stock > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {product.stock > 0
                ? `Stock disponible: ${product.stock}`
                : "Agotado — sin stock"}
            </p>
          )}
          {product.category && (
            <span className="inline-block rounded-full bg-reny-green px-3 py-1 text-sm text-white">
              {product.category.name}
            </span>
          )}
          {details.length > 0 && (
            <ul className="space-y-1 rounded-xl bg-white/60 p-4 text-sm">
              {details.map(([label, value]) => (
                <li key={label}>
                  <span className="font-semibold">{label}:</span> {value}
                </li>
              ))}
            </ul>
          )}
          <button
            disabled
            className={`mt-4 w-full cursor-not-allowed rounded-lg py-3 font-bold text-white opacity-60 ${
              product.stock > 0
                ? "bg-gradient-to-r from-reny-purple to-reny-pink"
                : "bg-gray-400"
            }`}
          >
            {product.stock > 0
              ? "Próximamente disponible para compra"
              : "Agotado"}
          </button>
        </div>
      </div>
    </div>
  );
}
