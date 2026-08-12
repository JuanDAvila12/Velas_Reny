-- Tabla de perfiles (extiende auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- Trigger para crear perfil al registrarse
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Categorías (usa las que indicaste)
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null
);

insert into public.categories (name, slug) values
  ('Temporada Navideña', 'temporada-navidena'),
  ('Amor y Amistad', 'amor-y-amistad'),
  ('Día de Muertos', 'dia-de-muertos'),
  ('Bautizos', 'bautizos'),
  ('Baby Shower', 'baby-shower'),
  ('XV Años', 'xv-anos'),
  ('Eventos', 'eventos'),
  ('Aromáticas', 'aromaticas');

-- Productos
create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  description text,
  price decimal(10,2),
  stock integer default 0,
  category_id bigint references public.categories(id),
  image_url text,
  images text[],
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- Mensajes de contacto
create table public.contact_messages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);