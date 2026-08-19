-- =====================================================================
-- Velas Reny — Esquema, Seguridad (RLS), Trigger y Storage
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase.
-- Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- =====================================================================

-- 0) Exponer tablas al Data API (roles anon/authenticated)
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- 1) Función is_admin() (SECURITY DEFINER, evita recursión de RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Tabla profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- 3) Trigger handle_new_user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      null
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Tabla categories
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug) values
  ('Temporada Navideña', 'temporada-navidena'),
  ('Amor y Amistad', 'amor-y-amistad'),
  ('Día de Muertos', 'dia-de-muertos'),
  ('Bautizos', 'bautizos'),
  ('Baby Shower', 'baby-shower'),
  ('XV Años', 'xv-anos'),
  ('Eventos', 'eventos'),
  ('Aromáticas', 'aromaticas')
on conflict (slug) do nothing;

-- 5) Tabla products (aroma/color/tamaño/intensidad)
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  category_id bigint references public.categories(id) on delete set null,
  image_url text,
  aroma text,
  color text,
  tamano text,
  intensidad text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists aroma text;
alter table public.products add column if not exists color text;
alter table public.products add column if not exists tamano text;
alter table public.products add column if not exists intensidad text;
alter table public.products add column if not exists updated_at timestamptz not null default now();

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_is_featured_idx on public.products (is_featured);
create index if not exists products_aroma_idx on public.products (aroma);

-- 6) Tabla contact_messages
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- 7) Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.contact_messages enable row level security;

-- 8) Políticas RLS — profiles
--    · El usuario lee/actualiza/inserta SOLO su propio perfil.
--    · El administrador puede leer todos (solo lectura sobre ajenos).
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- 9) Políticas RLS — products
--    · Lectura pública (anon + authenticated).
--    · Escritura (insert/update/delete) solo administradores.
drop policy if exists products_select_public on public.products;
create policy products_select_public
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists products_insert_admin on public.products;
create policy products_insert_admin
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists products_update_admin on public.products;
create policy products_update_admin
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- 10) Políticas RLS — categories
--     · Lectura pública.
--     · Escritura solo administradores.
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists categories_insert_admin on public.categories;
create policy categories_insert_admin
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists categories_update_admin on public.categories;
create policy categories_update_admin
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists categories_delete_admin on public.categories;
create policy categories_delete_admin
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- 11) Políticas RLS — contact_messages
--     · Inserción pública (visitantes y autenticados).
--     · SIN select público. Solo administradores leen mensajes.
drop policy if exists contact_insert_public on public.contact_messages;
create policy contact_insert_public
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists contact_select_admin on public.contact_messages;
create policy contact_select_admin
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

-- 12) Storage — bucket "product-images" (público) y sus políticas
--     · Todos leen. Solo administradores suben/actualizan/borran.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists product_images_select on storage.objects;
create policy product_images_select
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists product_images_insert_admin on storage.objects;
create policy product_images_insert_admin
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_update_admin on storage.objects;
create policy product_images_update_admin
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_delete_admin on storage.objects;
create policy product_images_delete_admin
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- =====================================================================
-- 13) Tabla stock_movements (control de inventario / movimientos de stock)
-- =====================================================================
create table if not exists public.stock_movements (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  movement_type text not null check (movement_type in ('entrada','salida','ajuste_inicial','ajuste')),
  quantity integer not null,
  note text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_id_idx on public.stock_movements (product_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements (created_at desc);

alter table public.stock_movements enable row level security;

-- Convención de `quantity` (documentada en README.md):
--   · entrada:        cantidad POSITIVA; se suma al stock.
--   · salida:         cantidad POSITIVA; se resta del stock (no puede quedar negativo).
--   · ajuste:         cantidad = NUEVO stock absoluto (>= 0).
--   · ajuste_inicial: cantidad = NUEVO stock absoluto (>= 0).

-- 14) Políticas RLS — stock_movements (SOLO administradores)
drop policy if exists stock_movements_select_admin on public.stock_movements;
create policy stock_movements_select_admin
  on public.stock_movements for select
  to authenticated
  using (public.is_admin());

drop policy if exists stock_movements_insert_admin on public.stock_movements;
create policy stock_movements_insert_admin
  on public.stock_movements for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists stock_movements_update_admin on public.stock_movements;
create policy stock_movements_update_admin
  on public.stock_movements for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists stock_movements_delete_admin on public.stock_movements;
create policy stock_movements_delete_admin
  on public.stock_movements for delete
  to authenticated
  using (public.is_admin());

-- 15) Trigger update_product_stock: al INSERTAR un movimiento,
--     actualiza products.stock de forma atómica.
create or replace function public.update_product_stock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_stock integer;
  new_stock integer;
begin
  -- Bloquea la fila del producto para evitar condiciones de carrera (atomicidad).
  select p.stock
    into current_stock
    from public.products p
   where p.id = new.product_id
   for update;

  if not found then
    raise exception 'El producto % no existe.', new.product_id;
  end if;

  case new.movement_type
    when 'entrada' then
      if new.quantity <= 0 then
        raise exception 'La cantidad de una entrada debe ser un entero positivo.';
      end if;
      new_stock := current_stock + new.quantity;

    when 'salida' then
      if new.quantity <= 0 then
        raise exception 'La cantidad de una salida debe ser un entero positivo.';
      end if;
      if new.quantity > current_stock then
        raise exception 'Stock insuficiente: hay %, se intenta retirar %.', current_stock, new.quantity;
      end if;
      new_stock := current_stock - new.quantity;

    when 'ajuste', 'ajuste_inicial' then
      if new.quantity < 0 then
        raise exception 'El ajuste debe indicar un stock absoluto no negativo.';
      end if;
      new_stock := new.quantity;

    else
      raise exception 'Tipo de movimiento no válido: %', new.movement_type;
  end case;

  update public.products
     set stock = new_stock,
         updated_at = now()
   where id = new.product_id;

  return new;
end;
$$;

drop trigger if exists trg_update_product_stock on public.stock_movements;
create trigger trg_update_product_stock
  after insert on public.stock_movements
  for each row execute function public.update_product_stock();

-- =====================================================================
-- 16) PROMOCIONAR ADMINISTRADOR (manual, después de registrarte)
--     Sustituye 'TU_USER_ID' por el UUID real (Dashboard -> Auth -> Users).
-- =====================================================================
-- update public.profiles
--   set is_admin = true
--   where id = 'TU_USER_ID';

-- =====================================================================
-- 17) PEDIDOS (orders, order_items) — checkout web + punto de venta (POS)
-- =====================================================================

-- Secuencia global para números de pedido únicos.
create sequence if not exists public.order_number_seq;
grant usage, select on sequence public.order_number_seq to anon, authenticated, service_role;

-- Función que genera un número de pedido con formato 'PED-YYYY-XXXX'.
-- Es SECURITY DEFINER para que la secuencia se consuma con permisos del owner.
create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_val bigint;
begin
  select nextval('public.order_number_seq') into next_val;
  return 'PED-' || to_char(now(), 'YYYY') || '-' || lpad(next_val::text, 4, '0');
end;
$$;
grant execute on function public.generate_order_number() to anon, authenticated, service_role;

-- Tabla de pedidos.
-- · source: 'web' (checkout) o 'pos' (venta en mostrador).
-- · user_id: null para ventas POS (cliente de mostrador).
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_number text unique not null default public.generate_order_number(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  source text not null default 'web' check (source in ('web','pos')),
  total numeric(10,2) not null check (total >= 0),
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  payment_method text not null default 'efectivo',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Tabla de items de pedido (snapshot de nombre y precio al momento de la compra).
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Permisos explícitos para las nuevas tablas (redundante con default privileges,
-- pero idempotente y seguro si el script se ejecuta por partes).
grant select, insert, update, delete on public.orders to anon, authenticated, service_role;
grant select, insert, update, delete on public.order_items to anon, authenticated, service_role;

-- 18) Políticas RLS — orders
--     · El usuario lee SOLO sus propios pedidos.
--     · El administrador lee todos y actualiza/borra.
--     · Inserción: el usuario inserta pedidos propios; el admin puede insertar
--       pedidos POS (user_id null o ajeno).
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin
  on public.orders for select
  to authenticated
  using (public.is_admin());

drop policy if exists orders_insert_authenticated on public.orders;
create policy orders_insert_authenticated
  on public.orders for insert
  to authenticated
  with check (public.is_admin() or user_id = auth.uid());

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists orders_delete_admin on public.orders;
create policy orders_delete_admin
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- 19) Políticas RLS — order_items
--     · Misma visibilidad que orders (por JOIN), y escritura solo admin.
drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own
  on public.order_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists order_items_insert_own on public.order_items;
create policy order_items_insert_own
  on public.order_items for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists order_items_update_admin on public.order_items;
create policy order_items_update_admin
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists order_items_delete_admin on public.order_items;
create policy order_items_delete_admin
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

-- 20) Trigger decrease_stock_on_order_item
--     Tras insertar un item, descuenta el stock de products de forma atómica
--     (bloquea la fila con FOR UPDATE y lanza excepción si no hay suficiente).
--     SECURITY DEFINER: puede actualizar products aunque el usuario no sea admin.
create or replace function public.decrease_stock_on_order_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_stock integer;
begin
  select p.stock
    into current_stock
    from public.products p
   where p.id = new.product_id
   for update;

  if not found then
    raise exception 'El producto % no existe.', new.product_id;
  end if;

  if current_stock < new.quantity then
    raise exception 'Stock insuficiente para el producto %: disponible %.',
      new.product_id, current_stock;
  end if;

  update public.products
     set stock = current_stock - new.quantity,
         updated_at = now()
   where id = new.product_id;

  return new;
end;
$$;

drop trigger if exists trg_decrease_stock_on_order_item on public.order_items;
create trigger trg_decrease_stock_on_order_item
  after insert on public.order_items
  for each row execute function public.decrease_stock_on_order_item();

-- =====================================================================
-- 21) Funciones RPC transaccionales para crear pedidos.
--     Hacen TODO en una única transacción (validar stock con FOR UPDATE,
--     crear el pedido y sus items) de modo que si el trigger lanza una
--     excepción (stock insuficiente) se revierte también el pedido,
--     evitando pedidos "huérfanos". El precio siempre se lee de la BD,
--     nunca del cliente.
-- =====================================================================

-- Pedido web (checkout): requiere sesión (auth.uid()) y crea el pedido a su nombre.
create or replace function public.create_order(
  p_items jsonb,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_customer_email text,
  p_payment_method text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id bigint;
  v_order_number text;
  v_total numeric(10,2) := 0;
  item record;
  v_name text;
  v_price numeric(10,2);
  v_stock integer;
  v_subtotal numeric(10,2);
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito esta vacio.';
  end if;

  -- 1) Validar stock y precio, calcular total (bloqueando cada producto).
  for item in
    select
      (e->>'product_id')::bigint as product_id,
      (e->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) as e
  loop
    if item.quantity is null or item.quantity <= 0 then
      raise exception 'Cantidad invalida para el producto %.', item.product_id;
    end if;

    select p.name, p.price, p.stock
      into v_name, v_price, v_stock
      from public.products p
     where p.id = item.product_id
     for update;

    if not found then
      raise exception 'El producto % no existe.', item.product_id;
    end if;

    if v_price is null then
      raise exception 'El producto % no tiene precio.', item.product_id;
    end if;

    if v_stock < item.quantity then
      raise exception 'Stock insuficiente para el producto %.', item.product_id;
    end if;

    v_subtotal := round(v_price * item.quantity, 2);
    v_total := v_total + v_subtotal;
  end loop;

  -- 2) Crear el pedido (el default genera el order_number).
  insert into public.orders (
    user_id, status, source, total,
    customer_name, customer_email, customer_phone, customer_address,
    payment_method
  ) values (
    v_user_id, 'pending', 'web', v_total,
    nullif(p_customer_name, ''), nullif(p_customer_email, ''),
    nullif(p_customer_phone, ''), nullif(p_customer_address, ''),
    p_payment_method
  )
  returning id, order_number into v_order_id, v_order_number;

  -- 3) Insertar items (el trigger descuenta el stock).
  for item in
    select
      (e->>'product_id')::bigint as product_id,
      (e->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) as e
  loop
    select p.name, p.price into v_name, v_price
      from public.products p
     where p.id = item.product_id;

    v_subtotal := round(v_price * item.quantity, 2);

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity, subtotal
    ) values (
      v_order_id, item.product_id, v_name, v_price, item.quantity, v_subtotal
    );
  end loop;

  return v_order_number;
end;
$$;
grant execute on function public.create_order(jsonb, text, text, text, text, text) to authenticated;

-- Pedido POS: solo administradores. Crea un pedido de mostrador (user_id null,
-- source 'pos', status 'completed').
create or replace function public.create_pos_order(
  p_items jsonb,
  p_customer_name text,
  p_notes text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id bigint;
  v_order_number text;
  v_total numeric(10,2) := 0;
  item record;
  v_name text;
  v_price numeric(10,2);
  v_stock integer;
  v_subtotal numeric(10,2);
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El ticket esta vacio.';
  end if;

  -- 1) Validar stock y precio, calcular total (bloqueando cada producto).
  for item in
    select
      (e->>'product_id')::bigint as product_id,
      (e->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) as e
  loop
    if item.quantity is null or item.quantity <= 0 then
      raise exception 'Cantidad invalida para el producto %.', item.product_id;
    end if;

    select p.name, p.price, p.stock
      into v_name, v_price, v_stock
      from public.products p
     where p.id = item.product_id
     for update;

    if not found then
      raise exception 'El producto % no existe.', item.product_id;
    end if;

    if v_price is null then
      raise exception 'El producto % no tiene precio.', item.product_id;
    end if;

    if v_stock < item.quantity then
      raise exception 'Stock insuficiente para el producto %.', item.product_id;
    end if;

    v_subtotal := round(v_price * item.quantity, 2);
    v_total := v_total + v_subtotal;
  end loop;

  -- 2) Crear el pedido POS.
  insert into public.orders (
    user_id, status, source, total,
    customer_name, payment_method, notes
  ) values (
    null, 'completed', 'pos', v_total,
    nullif(p_customer_name, ''), 'efectivo', nullif(p_notes, '')
  )
  returning id, order_number into v_order_id, v_order_number;

  -- 3) Insertar items (el trigger descuenta el stock).
  for item in
    select
      (e->>'product_id')::bigint as product_id,
      (e->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) as e
  loop
    select p.name, p.price into v_name, v_price
      from public.products p
     where p.id = item.product_id;

    v_subtotal := round(v_price * item.quantity, 2);

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity, subtotal
    ) values (
      v_order_id, item.product_id, v_name, v_price, item.quantity, v_subtotal
    );
  end loop;

  return v_order_number;
end;
$$;
grant execute on function public.create_pos_order(jsonb, text, text) to authenticated;

