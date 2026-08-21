# Velas Reni 🕯️

Catálogo de velas artesanales construido con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase** (Auth, PostgreSQL, Storage y Row Level Security).

## Características

- 🔐 Autenticación con Supabase Auth (registro + inicio de sesión + **Google y Facebook**).
- 👤 Perfil de usuario editable (nombre, teléfono, dirección).
- 🕯️ Catálogo público con filtros por **categoría** y **aroma**.
- 🛡️ Panel de administración protegido por rol (`profiles.is_admin`).
- 📦 Control de inventario con movimientos (entradas / salidas / ajustes).
- 🛒 Carrito de compras persistente (localStorage) con badge en el navbar.
- 💳 Checkout protegido con creación de pedidos y descuento automático de stock.
- 🧾 Punto de venta (POS) para administradores.
- 🖼️ Subida de imágenes a Supabase Storage (bucket `product-images`).
- ✉️ Formulario de contacto para visitantes y usuarios autenticados.
- 🔒 Seguridad a nivel de base de datos con **Row Level Security (RLS)**.

## Requisitos

- Node.js 18.18+ (recomendado Node 20+).
- Una cuenta de [Supabase](https://supabase.com) con un proyecto creado.

## Configuración local

1. Clona el repositorio:

   ```bash
   git clone https://github.com/JuanDAvila12/Velas_Reni.git
   cd Velas_Reni
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
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   > `NEXT_PUBLIC_SITE_URL` es la URL pública del sitio y se usa para los
   > redirects de OAuth (Google/Facebook). En producción, pon
   > `https://velas-reni.vercel.app` (o tu dominio real).

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

- Crea las tablas `profiles`, `products`, `categories`, `contact_messages`
  y `stock_movements`.
- Crea la función `public.is_admin()` (SECURITY DEFINER) para validar el rol.
- Crea el trigger `handle_new_user` que crea el perfil al registrarse
  (incluye `full_name` y `avatar_url` desde `raw_user_meta_data`).
- Crea el trigger `update_product_stock` que mantiene `products.stock`
  sincronizado con cada movimiento de inventario.
- Habilita **RLS** y crea todas las políticas:
  - `profiles`: cada usuario lee/edita solo su perfil; los admins leen todos.
  - `products`: lectura pública; escritura solo administradores.
  - `categories`: lectura pública; escritura solo administradores.
  - `contact_messages`: inserción pública; solo admins leen.
  - `stock_movements`: solo administradores pueden leer/escribir.
  - `orders`: el usuario lee sus propios pedidos; los admins leen todos;
    inserción para checkout (`auth.uid() = user_id`) y para POS (solo admins).
  - `order_items`: misma visibilidad que `orders`; escritura solo admins.
- Crea la secuencia `order_number_seq` y la función `generate_order_number()`
  para números de pedido con formato `PED-YYYY-XXXX`.
- Crea el trigger `decrease_stock_on_order_item` (SECURITY DEFINER) que
  descuenta el stock de `products` al insertar cada item de un pedido.
- Crea las funciones RPC `create_order` y `create_pos_order`, que crean el
  pedido y sus items en una única transacción (evita pedidos huérfanos y carreras).
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

## Carga masiva de productos (Bulk Upload)

En `/admin`, la pestaña **Carga masiva** permite crear muchos productos a la vez:

- **Archivo CSV**: sube un `.csv` con las columnas de la plantilla
  ([`bulk-template.csv`](./public/bulk-template.csv)).
- **Pegar JSON**: pega un array de objetos con los mismos campos.

### Formato (columnas / claves)

| Campo         | Obligatorio | Descripción |
| ------------- | ----------- | ----------- |
| `name`        | Sí          | Nombre del producto. |
| `slug`        | No          | URL amigable; si falta se genera del nombre. |
| `description` | No          | Descripción. |
| `price`       | Sí          | Precio (número positivo). |
| `stock`       | No          | Entero ≥ 0 (por defecto 0). |
| `category`    | No          | Nombre o id; si el nombre no existe se crea la categoría. |
| `aroma`       | No          | Aroma. |
| `color`       | No          | Color. |
| `tamano`      | No          | Tamaño. |
| `intensidad`  | No          | Intensidad. |
| `image_url`   | No          | URL externa de la imagen. |
| `is_featured` | No          | `true`/`false` (por defecto `false`). |

### Ejemplo JSON

```json
[
  {
    "name": "Vela de Vainilla",
    "price": 120,
    "stock": 10,
    "category": "Aromáticas",
    "aroma": "Vainilla",
    "is_featured": true
  }
]
```

### Notas de seguridad

- Solo administradores pueden usar la carga masiva (se verifica `is_admin()`).
- Máximo 1 MB por archivo/JSON.
- Los campos se validan y sanean en el servidor.
- Los slugs se generan con unicidad automática.
- Los errores se reportan fila por fila.

## Autenticación social (Google y Facebook)

El flujo OAuth ya está implementado en el código:

- Botones "Continuar con Google / Facebook" en `/login` y `/register`.
- Server Actions en `app/auth/actions.ts` que llaman a `signInWithOAuth`.
- Callback en `app/auth/callback/route.ts` que intercambia el `code` por una
  sesión con `exchangeCodeForSession` y redirige a `/`.

### Configuración en Supabase

1. **Google**:
   - Crea credenciales OAuth en
     [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Tipo *Aplicación web*; URI de redirección autorizada:
     `https://TU-PROYECTO.supabase.co/auth/v1/callback`.
   - Copia el *Client ID* y *Client Secret*.
   - En Supabase Dashboard → **Authentication → Providers → Google**, actívalo
     y pega las credenciales.

2. **Facebook**:
   - Crea una app en [Facebook for Developers](https://developers.facebook.com/).
   - Producto *Facebook Login* → *Valid OAuth Redirect URIs*:
     `https://TU-PROYECTO.supabase.co/auth/v1/callback`.
   - Copia el *App ID* y *App Secret*.
   - En Supabase Dashboard → **Authentication → Providers → Facebook**, actívalo
     y pega las credenciales.

3. Define `NEXT_PUBLIC_SITE_URL` (ver "Configuración local"). El callback de la
   app es `${NEXT_PUBLIC_SITE_URL}/auth/callback`.

> Nota: al registrarse con Google/Facebook, el trigger `handle_new_user` crea
> el perfil con `full_name` y `avatar_url` extraídos de los metadatos.

## Control de inventario (stock)

En `/admin` → pestaña **Inventario**:

- **Registrar movimiento**: producto (dropdown), tipo, cantidad y nota.
  - `entrada`: suma al stock.
  - `salida`: resta del stock (no puede quedar negativo).
  - `ajuste`: establece el stock al valor absoluto indicado.
- **Stock actual**: tabla con nombre, categoría y stock (con buscador).
- **Últimos movimientos**: fecha, producto, tipo, cantidad y usuario.

Todo se guarda en la tabla `stock_movements` y el trigger `update_product_stock`
mantiene `products.stock` sincronizado de forma atómica.

### Convención de `quantity`

| Tipo             | Significado de `quantity`            |
| ---------------- | ------------------------------------ |
| `entrada`        | Cantidad **positiva**; se **suma**.  |
| `salida`         | Cantidad **positiva**; se **resta**. |
| `ajuste`         | **Nuevo stock absoluto** (≥ 0).      |
| `ajuste_inicial` | **Nuevo stock absoluto** (≥ 0).      |

Un archivo de ejemplo está en
[`stock_movements_sample.csv`](./stock_movements_sample.csv) (`product_id` debe
reemplazarse por los IDs reales de tus productos).

### Seguridad

- Solo administradores pueden leer o escribir movimientos (RLS + `is_admin()`).
- El trigger lanza una excepción si no hay stock suficiente en una salida,
  revirtiendo la transacción completa.

## Carrito, checkout y punto de venta (POS)

### Carrito

- **Contexto global** en `context/CartContext.tsx`, envuelto en `app/layout.tsx`
  con `<CartProvider>`.
- Persistido en `localStorage` bajo la clave `velasreni_cart`.
- Ícono con badge en el `Navbar` que muestra el total de artículos y enlaza a
  `/carrito`.
- Página `/carrito`: editar cantidades, quitar artículos, subtotales y total.

### Checkout (`/checkout`, protegido)

- Solo usuarios autenticados (el `proxy` redirige a `/login`).
- Resumen del pedido + formulario (nombre, teléfono, dirección, método de pago).
- La Server Action `placeOrder` llama a la función RPC `create_order`, que:
  - Verifica la sesión y valida cantidades.
  - **Lee los precios actuales desde la base de datos** (no confía en el cliente).
  - Bloquea cada producto con `FOR UPDATE` y valida stock (evita carreras).
  - Inserta `orders` + `order_items` en una transacción; el trigger
    `decrease_stock_on_order_item` descuenta el stock automáticamente.
- Página de confirmación `/pedido-confirmado/[order_number]` con el resumen.

### Punto de venta (POS)

- En `/admin` → pestaña **Punto de venta**.
- Buscador por nombre/código, ticket temporal (solo `useState`, sin persistir),
  campo de cliente opcional y nota.
- El botón **Cobrar** llama a la Server Action `createPosOrder`, que invoca la
  RPC `create_pos_order` (solo administradores), creando un pedido con
  `source='pos'` y `status='completed'`, y descuenta el stock.

### Nota sobre el esquema de pedidos

La columna `source` de `orders` distingue el origen de la venta:

- `web`: pedidos del checkout (con `user_id`).
- `pos`: ventas de mostrador (`user_id` nulo).

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
  admin/          # Panel de administración (protegido por rol) + POS
  auth/           # Acciones OAuth + callback de Google/Facebook
  carrito/        # Carrito de compras
  categorias/     # Listado y detalle por categoría
  checkout/       # Checkout (protegido) + Server Action
  contacto/       # Formulario de contacto
  login/          # Inicio de sesión
  pedido-confirmado/ # Confirmación de pedido
  perfil/         # Perfil del usuario
  productos/      # Catálogo y detalle de producto
  register/       # Registro
components/       # Navbar, Footer, ProductCard, CartView, CheckoutForm, POSPanel...
context/          # CartContext (estado global del carrito)
lib/
  supabase/       # Clientes de Supabase (browser y server)
  types.ts        # Tipos compartidos
proxy.ts          # Protección de rutas (antes middleware)
bd.sql            # Script SQL completo (esquema, RLS, triggers, storage)
stock_movements_sample.csv  # Ejemplo de movimientos de inventario
```

## Seguridad

- RLS habilitado en todas las tablas expuestas.
- El rol se almacena en `profiles.is_admin` (no en metadatos editables).
- `getUser()` (validado contra Auth) en lugar de `getSession()`.
- Las Server Actions validan autorización y entradas en el servidor.
- El flujo OAuth redirige a rutas internas (evita *open redirects*).
- Los movimientos de inventario solo los escriben administradores y el stock
  se actualiza en la BD (trigger), nunca desde el cliente.
- Los pedidos se crean en el servidor vía RPC (SECURITY DEFINER); los precios
  se leen de la BD y el stock se descuenta en la BD (trigger), nunca en el cliente.
- Los parámetros de Supabase evitan SQL injection.
- La `service_role key` nunca se expone al navegador.

## Notas

- Los roles se gestionan manualmente por SQL (no hay UI de usuarios).
- Los pedidos POS quedan con `user_id` nulo y `source='pos'`; los del checkout
  quedan ligados al usuario autenticado.
- Recuerda ejecutar `bd.sql` en Supabase antes de probar el checkout o el POS.
