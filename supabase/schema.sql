-- AcadLab Moz - schema inicial para Supabase/Postgres
-- Execute este arquivo no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.universidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocos (
  id uuid primary key default gen_random_uuid(),
  universidade_id uuid not null references public.universidades(id) on delete cascade,
  nome text not null,
  descricao text,
  valor_base numeric(12,2),
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (universidade_id, nome)
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  universidade_id uuid not null references public.universidades(id) on delete restrict,
  bloco_id uuid not null references public.blocos(id) on delete restrict,
  nome text not null,
  curso text not null,
  tipo text not null,
  contato text not null,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  data_entrada date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trabalhos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo_trabalho text not null check (tipo_trabalho in ('forum', 'avaliacao', 'exame')),
  prazo date not null,
  status text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluido', 'atrasado')),
  valor numeric(12,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  valor_total numeric(12,2) not null check (valor_total >= 0),
  valor_pago numeric(12,2) not null default 0 check (valor_pago >= 0),
  valor_pendente numeric(12,2) generated always as (greatest(valor_total - valor_pago, 0)) stored,
  data_pagamento date,
  metodo text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blocos_universidade_id on public.blocos(universidade_id);
create index if not exists idx_clientes_universidade_id on public.clientes(universidade_id);
create index if not exists idx_clientes_bloco_id on public.clientes(bloco_id);
create index if not exists idx_trabalhos_cliente_id on public.trabalhos(cliente_id);
create index if not exists idx_trabalhos_prazo on public.trabalhos(prazo);
create index if not exists idx_pagamentos_cliente_id on public.pagamentos(cliente_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_universidades_updated_at on public.universidades;
create trigger trg_universidades_updated_at
before update on public.universidades
for each row
execute function public.set_updated_at();

drop trigger if exists trg_blocos_updated_at on public.blocos;
create trigger trg_blocos_updated_at
before update on public.blocos
for each row
execute function public.set_updated_at();

drop trigger if exists trg_clientes_updated_at on public.clientes;
create trigger trg_clientes_updated_at
before update on public.clientes
for each row
execute function public.set_updated_at();

drop trigger if exists trg_trabalhos_updated_at on public.trabalhos;
create trigger trg_trabalhos_updated_at
before update on public.trabalhos
for each row
execute function public.set_updated_at();

drop trigger if exists trg_pagamentos_updated_at on public.pagamentos;
create trigger trg_pagamentos_updated_at
before update on public.pagamentos
for each row
execute function public.set_updated_at();

create or replace view public.vw_trabalhos_alerta as
select
  t.id,
  t.cliente_id,
  c.nome as cliente_nome,
  c.contato as cliente_contato,
  c.universidade_id,
  c.bloco_id,
  t.tipo_trabalho,
  t.prazo,
  t.status,
  t.valor,
  (t.prazo - current_date) as dias_para_prazo,
  case
    when t.status = 'concluido' then 'ok'
    when t.prazo < current_date then 'atrasado'
    when t.prazo <= current_date + 2 then 'critico'
    when t.prazo <= current_date + 7 then 'proximo'
    else 'normal'
  end as nivel_alerta
from public.trabalhos t
join public.clientes c on c.id = t.cliente_id;

create or replace view public.vw_pagamentos_alerta as
select
  p.id,
  p.created_at,
  p.cliente_id,
  c.nome as cliente_nome,
  c.contato as cliente_contato,
  c.universidade_id,
  c.bloco_id,
  p.valor_total,
  p.valor_pago,
  p.valor_pendente,
  p.data_pagamento,
  p.metodo,
  case
    when p.valor_pendente <= 0 then 'quitado'
    when p.data_pagamento is null then 'pendente'
    when p.data_pagamento < current_date and p.valor_pendente > 0 then 'atrasado'
    else 'pendente'
  end as status_pagamento,
  case
    when p.valor_pendente <= 0 then 'ok'
    when p.data_pagamento is null then 'atencao'
    when p.data_pagamento < current_date and p.valor_pendente > 0 then 'critico'
    else 'atencao'
  end as nivel_alerta
from public.pagamentos p
join public.clientes c on c.id = p.cliente_id;

create or replace view public.vw_clientes_por_bloco as
select
  u.id as universidade_id,
  u.nome as universidade_nome,
  b.id as bloco_id,
  b.nome as bloco_nome,
  count(c.id) filter (where c.status = 'ativo') as clientes_ativos,
  count(c.id) filter (where c.status = 'inativo') as clientes_inativos,
  count(c.id) as total_clientes
from public.universidades u
left join public.blocos b on b.universidade_id = u.id
left join public.clientes c on c.bloco_id = b.id
group by u.id, u.nome, b.id, b.nome;

-- Dados de teste solicitados
insert into public.universidades (nome, status)
values ('Universidade AcadLab Teste', 'ativo')
on conflict (nome) do nothing;

insert into public.blocos (universidade_id, nome, descricao, valor_base, status)
select u.id, 'Bloco A', 'Bloco inicial de teste', 2500, 'ativo'
from public.universidades u
where u.nome = 'Universidade AcadLab Teste'
on conflict (universidade_id, nome) do nothing;

insert into public.clientes (universidade_id, bloco_id, nome, curso, tipo, contato, status, data_entrada)
select
  u.id,
  b.id,
  'Cliente Demo',
  'Engenharia Informática',
  'premium',
  '258840000000',
  'ativo',
  current_date
from public.universidades u
join public.blocos b on b.universidade_id = u.id and b.nome = 'Bloco A'
where u.nome = 'Universidade AcadLab Teste'
and not exists (
  select 1 from public.clientes c where c.nome = 'Cliente Demo' and c.universidade_id = u.id
);
