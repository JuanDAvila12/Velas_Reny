export default function Footer() {
  return (
    <footer className="bg-reny-purple-dark text-white py-6 mt-12">
      <div className="max-w-6xl mx-auto text-center">
        <p className="font-caveat text-xl">Velas Reny</p>
        <p className="text-sm mt-1">
          © {new Date().getFullYear()} Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}