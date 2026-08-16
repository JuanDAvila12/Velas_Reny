import {
  signInWithGoogle,
  signInWithFacebook,
} from "@/app/auth/actions";
import { GoogleIcon, FacebookIcon } from "@/components/icons";

/**
 * Botones de autenticación social (Google y Facebook).
 *
 * Cada botón es un `<form>` con su Server Action como `formAction`.
 * Los estilos respetan la paleta pastel y el glassmorphism del sitio.
 */
export default function SocialAuthButtons() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        o continúa con
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <form>
        <button
          type="submit"
          formAction={signInWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white/80 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-white hover:shadow"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
      </form>

      <form>
        <button
          type="submit"
          formAction={signInWithFacebook}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1877F2] py-3 font-semibold text-white shadow-sm transition hover:bg-[#166fe0] hover:shadow"
        >
          <FacebookIcon />
          Continuar con Facebook
        </button>
      </form>
    </div>
  );
}
