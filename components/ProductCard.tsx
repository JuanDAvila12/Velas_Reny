import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const chips = [
    product.aroma && `Aroma: ${product.aroma}`,
    product.color && `Color: ${product.color}`,
    product.tamano && product.tamano,
    product.intensidad && product.intensidad,
  ].filter(Boolean) as string[];

  return (
    <Link href={`/productos/${product.slug}`} className="group animate-fade-up">
      <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image_url || "/placeholder-vela.jpg"}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.stock != null && product.stock <= 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow">
              Agotado
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-reny-purple-dark">
              Ver detalle
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-caveat text-2xl text-reny-purple-dark">
            {product.name}
          </h3>

          {chips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-reny-purple/20 px-2 py-0.5 text-xs text-reny-purple-dark"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-gradient text-lg font-bold">
              ${product.price ?? "—"}
            </p>
            {product.category && (
              <span className="rounded-full bg-reny-green px-2 py-0.5 text-xs text-white">
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
