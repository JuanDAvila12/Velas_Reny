import Link from "next/link";

const socials = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="mt-12 bg-gradient-to-br from-reny-purple-dark via-[#8B5CF6] to-reny-pink-dark px-4 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <p className="font-caveat text-3xl">Velas Reny</p>
          <p className="mt-2 text-sm text-white/80">
            Velas artesanales de cera de soya natural para iluminar tus
            momentos especiales.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
            Navegación
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href="/productos" className="hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/categorias" className="hover:text-white">
                Categorías
              </Link>
            </li>
            <li>
              <Link href="/sobre-nosotros" className="hover:text-white">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-white">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
            Síguenos
          </h3>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="rounded-full bg-white/20 p-2 transition hover:bg-white/40"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/20 pt-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} Velas Reny. Todos los derechos reservados.
      </div>
    </footer>
  );
}
