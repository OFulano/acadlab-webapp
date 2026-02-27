-- Migra??o incremental: m?dulo de contratos

create table if not exists public.contratos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  universidade_id uuid not null references public.universidades(id) on delete cascade,
  numero_contrato text not null unique,
  data_contrato date not null default current_date,
  ano_referencia integer not null default (extract(year from now())::integer),
  curso text,
  instituicao text,
  contato text,
  itens jsonb not null default '[]'::jsonb,
  valor_total numeric(12,2) not null default 0,
  percentual_pagamento numeric(5,2) not null default 100 check (percentual_pagamento >= 0 and percentual_pagamento <= 100),
  valor_pagamento numeric(12,2) generated always as ((valor_total * percentual_pagamento) / 100) stored,
  observacoes text,
  assinatura text not null default 'Ass :',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contratos_cliente_id on public.contratos(cliente_id);
create index if not exists idx_contratos_universidade_id on public.contratos(universidade_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_contratos_updated_at on public.contratos;
create trigger trg_contratos_updated_at
before update on public.contratos
for each row
execute function public.set_updated_at();

create or replace view public.vw_contratos_resumo as
select
  ct.id,
  ct.numero_contrato,
  ct.data_contrato,
  ct.ano_referencia,
  ct.valor_total,
  ct.percentual_pagamento,
  ct.valor_pagamento,
  ct.observacoes,
  ct.assinatura,
  ct.cliente_id,
  c.nome as cliente_nome,
  c.curso as cliente_curso,
  c.contato as cliente_contato,
  ct.universidade_id,
  u.nome as universidade_nome,
  ct.itens,
  ct.created_at,
  ct.updated_at
from public.contratos ct
join public.clientes c on c.id = ct.cliente_id
join public.universidades u on u.id = ct.universidade_id;
