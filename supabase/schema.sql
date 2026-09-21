-- PorcelanArt — banco do painel do vendedor
-- Cole TUDO isto no Supabase: menu "SQL Editor" > "New query" > Run.
-- Antes de rodar, troque EMAIL_DA_MAE@exemplo.com pelo e-mail que ela vai usar para entrar no painel.

-- 1) Quem pode editar (só este e-mail)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security; -- sem policies: só o SQL Editor mexe aqui
insert into public.admins (email) values (lower('EMAIL_DA_MAE@exemplo.com')) on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

-- 2) Kits / produtos do catálogo
create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  categoria text not null default 'Outros',
  resumo text not null default '',
  descricao text not null default '',
  detalhes jsonb not null default '[]',
  fotos jsonb not null default '[]',
  variacoes jsonb not null default '[]',
  preco numeric(10, 2),          -- preço base opcional (o site mostra "a partir de")
  status text not null default 'ativo' check (status in ('ativo', 'esgotado', 'oculto')),
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

-- 3) Peças do "Montar meu próprio kit" (com preço para a estimativa)
create table if not exists public.pecas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,            -- Xícara, Pires, Prato, Bandeja, Bule...
  modelo text not null,          -- nome do modelo
  preco numeric(10, 2),          -- preço BASE unitário — o site mostra "a partir de" (vazio = sob consulta)
  foto text,
  status text not null default 'ativo' check (status in ('ativo', 'esgotado', 'oculto')),
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

-- 4) Segurança: todo mundo LÊ (menos o oculto), só a mãe ESCREVE
alter table public.kits enable row level security;
alter table public.pecas enable row level security;

drop policy if exists "kits leitura" on public.kits;
create policy "kits leitura" on public.kits for select to anon, authenticated
  using (status <> 'oculto' or public.is_admin());
drop policy if exists "kits admin" on public.kits;
create policy "kits admin" on public.kits for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "pecas leitura" on public.pecas;
create policy "pecas leitura" on public.pecas for select to anon, authenticated
  using (status <> 'oculto' or public.is_admin());
drop policy if exists "pecas admin" on public.pecas;
create policy "pecas admin" on public.pecas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 5) Fotos: pasta pública para leitura, só a mãe envia/apaga
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) on conflict (id) do nothing;

drop policy if exists "fotos leitura" on storage.objects;
create policy "fotos leitura" on storage.objects for select to anon, authenticated using (bucket_id = 'fotos');
drop policy if exists "fotos admin" on storage.objects;
create policy "fotos admin" on storage.objects for all to authenticated
  using (bucket_id = 'fotos' and public.is_admin()) with check (bucket_id = 'fotos' and public.is_admin());
