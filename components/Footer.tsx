export default function Footer() {
  return (
    <footer className="mt-12 bg-reny-purple-dark px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl text-center">
        <p className="font-caveat text-xl">Velas Reny</p>
        <p className="mt-1 text-sm">
          © {new Date().getFullYear()} Todos los derechos reservados
        </p>
        <p className="mt-1 text-xs text-white/70">
          Hecho a mano con cera de soya natural
        </p>
      </div>
    </footer>
  );
}
