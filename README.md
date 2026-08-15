# Velas Reny 🕯️

Catálogo de velas artesanales construido con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase** (Auth, PostgreSQL, Storage y Row Level Security).

## Características

- 🔐 Autenticación con Supabase Auth (registro + inicio de sesión).
- 👤 Perfil de usuario editable (nombre, teléfono, dirección).
- 🕯️ Catálogo público con filtros por **categoría** y **aroma**.
- 🛡️ Panel de administración protegido por rol (`profiles.is_admin`).
- 🖼️ Subida de imágenes a Supabase Storage (bucket `product-images`).
- ✉️ Formulario de contacto para visitantes y usuarios autenticados.
- 🔒 Seguridad a nivel de base de datos con **Row Level Security (RLS)**.

## Requisitos

- Node.js 18.18+ (recomendado Node 20+).
- Una cuenta de [Supabase](https://supabase.com) con un proyecto creado.

## Configuración local

1. Clona el repositorio:

   ```bash
   git clone https://github.com/JuanDAvila12/Velas_Reny.git
   cd Velas_Reny
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo de variables de entorno:

   ```bash
   cp .env.example .env.local
   ```

   Y rellena los valores reales (Supabase Dashboard → Project Settings → API):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
   ```

   > ⚠️ **Importante:** nunca pongas la `service_role key` en variables
   > `NEXT_PUBLIC_*`. `.env.local` ya está en `.gitignore`.

4. Configura la base de datos ejecutando el script `bd.sql`
   (ver sección "Configuración de Supabase").

5. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Configuración de Supabase

### 1. Base de datos y RLS

Abre **Supabase Dashboard → SQL Editor → New query**, pega el contenido
completo de [`bd.sql`](./bd.sql) y ejecútalo.

El script es **idempotente** y hace lo siguiente:

- Crea las tablas `profiles`, `products`, `categories` y `contact_messages`.
- Crea la función `public.is_admin()` (SECURITY DEFINER) para validar el rol.
- Crea el trigger `handle_new_user` que crea el perfil al registrarse.
- Habilita **RLS** y crea todas las políticas:
  - `profiles`: cada usuario lee/edita solo su perfil; los admins leen todos.
  - `products`: lectura pública; escritura solo administradores.
  - `categories`: lectura pública; escritura solo administradores.
  - `contact_messages`: inserción pública; solo admins leen.
- Crea el bucket de Storage `product-images` con sus políticas.

### 2. Promocionar un administrador

Después de registrarte, ejecuta en el SQL Editor (sustituye el UUID):

```sql
update public.profiles
set is_admin = true
where id = 'TU_USER_ID';
```

Puedes ver el UUID en **Dashboard → Authentication → Users**.

### 3. Storage

El bucket `product-images` es **público** (todos pueden ver las imágenes)
pero solo los administradores pueden subir, actualizar o borrar archivos.

## Scripts

| Comando          | Descripción                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Servidor de desarrollo (Turbopack).  |
| `npm run build`  | Compila para producción.             |
| `npm run start`  | Sirve la build de producción.        |
| `npm run lint`   | Ejecuta ESLint.                      |

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En [Vercel](https://vercel.com), importa el repositorio.
3. Configura las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Despliega.

Vercel detecta automáticamente Next.js. Recuerda haber ejecutado `bd.sql`
en Supabase **antes** de usar la aplicación en producción.

## Estructura del proyecto

```
app/
  admin/          # Panel de administración (protegido por rol)
  categorias/     # Listado y detalle por categoría
  contacto/       # Formulario de contacto
  login/          # Inicio de sesión
  perfil/         # Perfil del usuario
  productos/      # Catálogo y detalle de producto
  register/       # Registro
components/       # Navbar, Footer, ProductCard, AdminPanel
lib/
  supabase/       # Clientes de Supabase (browser y server)
  types.ts        # Tipos compartidos
proxy.ts          # Protección de rutas (antes middleware)
bd.sql            # Script SQL completo (esquema, RLS, storage)
```

## Seguridad

- RLS habilitado en todas las tablas expuestas.
- El rol se almacena en `profiles.is_admin` (no en metadatos editables).
- `getUser()` (validado contra Auth) en lugar de `getSession()`.
- Las Server Actions validan autorización y entradas en el servidor.
- Los parámetros de Supabase evitan SQL injection.
- La `service_role key` nunca se expone al navegador.

## Notas

- Los roles se gestionan manualmente por SQL (no hay UI de usuarios).
- El carrito/compra está pendiente de implementar ("Próximamente").
