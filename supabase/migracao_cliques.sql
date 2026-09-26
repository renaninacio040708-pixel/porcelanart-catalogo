-- Rodar UMA VEZ no projeto que já existe (Supabase → SQL Editor → New query → colar tudo → Run).
-- Adiciona o contador "cliques" (quantas vezes o cliente tocou em "Quero personalizar")
-- sem mexer em nada que já está cadastrado.

alter table public.kits add column if not exists cliques int not null default 0;

create or replace function public.registrar_clique_kit(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.kits set cliques = cliques + 1 where id = p_id;
$$;
grant execute on function public.registrar_clique_kit(uuid) to anon, authenticated;
