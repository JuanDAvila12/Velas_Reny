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
  phone text,
  address text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 3) Trigger handle_new_user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
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
-- 13) PROMOCIONAR ADMINISTRADOR (manual, después de registrarte)
--     Sustituye 'TU_USER_ID' por el UUID real (Dashboard -> Auth -> Users).
-- =====================================================================
-- update public.profiles
--   set is_admin = true
--   where id = 'TU_USER_ID';

