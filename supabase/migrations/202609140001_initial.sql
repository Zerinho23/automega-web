create extension if not exists "pgcrypto";

create type public.admin_role as enum ('admin', 'editor');
create type public.quote_status as enum ('new', 'reviewed', 'contacted', 'closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.admin_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default 'traffic-cone',
  image_url text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  location text,
  service_id uuid references public.services(id) on delete set null,
  image_url text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_images (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  public_url text not null,
  alt_text text not null default '',
  section text not null default 'gallery',
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id) on delete set null
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text not null,
  email text not null,
  city text not null,
  service_name text not null,
  message text not null,
  status public.quote_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles(id, full_name, role) values(new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'editor'); return new; end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.site_images enable row level security;
alter table public.quote_requests enable row level security;

create policy "Profiles can read own row" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public reads visible services" on public.services for select to anon, authenticated using (visible or public.is_admin());
create policy "Admins manage services" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public reads visible projects" on public.projects for select to anon, authenticated using (visible or public.is_admin());
create policy "Admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public reads visible images" on public.site_images for select to anon, authenticated using (visible or public.is_admin());
create policy "Admins manage images" on public.site_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Anyone creates quote requests" on public.quote_requests for insert to anon, authenticated with check (status = 'new');
create policy "Admins read quotes" on public.quote_requests for select to authenticated using (public.is_admin());
create policy "Admins update quotes" on public.quote_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete quotes" on public.quote_requests for delete to authenticated using (public.is_admin());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('site-images','site-images',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy "Public reads site images" on storage.objects for select to public using (bucket_id='site-images');
create policy "Admins upload site images" on storage.objects for insert to authenticated with check (bucket_id='site-images' and public.is_admin());
create policy "Admins update site images" on storage.objects for update to authenticated using (bucket_id='site-images' and public.is_admin());
create policy "Admins delete site images" on storage.objects for delete to authenticated using (bucket_id='site-images' and public.is_admin());

insert into public.site_settings(key,value) values
('site_name','AUTOMEGA'),('hero_title','Seguridad y control en cada vía'),('hero_text','Servicios de conificación y señalización vial temporal para obras, faenas y desvíos.'),
('about_title','Seguridad vial para cada trabajo'),('phone','+56 9 XXXX XXXX'),('whatsapp','+56 9 XXXX XXXX'),('email','contacto@automega.cl'),
('address','Concepción, Región del Biobío'),('coverage','Concepción y toda la Región del Biobío') on conflict (key) do nothing;

insert into public.services(title,description,icon,sort_order) values
('Conificación vial','Instalación y retiro de conos, delineadores y elementos de canalización para obras y desvíos.','traffic-cone',1),
('Señalización vial temporal','Implementación de señalética transitoria según normativa vigente.','construction',2),
('Control temporal del tránsito','Apoyo con bandereros y sistemas de control para mantener un flujo vehicular seguro.','hard-hat',3);

insert into public.projects(title,description,location,image_url,sort_order) values
('Conificación vial','Obras urbanas','Concepción','/images/vial2.png',1),
('Señalización temporal','Desvíos y cortes de tránsito','San Pedro de la Paz','/images/vial2.png',2),
('Control del tránsito','Apoyo en faenas','Talcahuano','/images/vial2.png',3);

-- Después de crear el primer usuario en Authentication, conviértelo en administrador:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='tu-correo@dominio.cl');
