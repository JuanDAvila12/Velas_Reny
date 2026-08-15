"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/productos", label: "Catálogo" },
  { href: "/sobre-nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function NavbarMenu({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-3xl font-caveat text-reny-purple-dark drop-shadow"
        >
          Velas Reny
        </Link>

        {/* Escritorio */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative text-sm font-medium text-reny-purple-dark transition hover:text-reny-pink-dark"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded bg-reny-pink-dark transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-reny-purple-dark shadow transition hover:bg-white"
            >
              Admin
            </Link>
          )}
          {isLoggedIn ? (
            <Link
              href="/perfil"
              className="rounded-full bg-gradient-to-r from-reny-purple to-reny-pink px-4 py-1.5 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              Mi cuenta
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-reny-purple to-reny-pink px-4 py-1.5 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Botón hamburguesa */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-reny-purple-dark md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="border-t border-white/60 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-reny-purple-dark transition hover:text-reny-pink-dark"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="font-bold text-reny-purple-dark"
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <Link
                href="/perfil"
                onClick={() => setOpen(false)}
                className="font-bold text-reny-pink-dark"
              >
                Mi cuenta
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="font-bold text-reny-pink-dark"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
