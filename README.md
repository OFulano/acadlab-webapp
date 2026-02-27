# AcadLab Moz WebApp

Esqueleto completo para gerenciamento de clientes, trabalhos e pagamentos com alertas automáticos.

## Estrutura

- `supabase/schema.sql`: banco de dados, relacionamentos, views de alerta e dados de teste.
- `supabase/003_create_contratos.sql`: migração incremental para habilitar o módulo de contratos.
- `backend/`: API Node.js + Express com CRUD e filtros.
- `frontend/`: React + Tailwind, responsivo para celular e desktop.

## 1) Configurar Supabase (primeiro passo real)

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e rode `supabase/schema.sql`.
3. Copie:
   - `Project URL` (Settings > API)
   - `service_role key` (Settings > API, usar apenas no backend)

## 2) Deploy do backend no Vercel (sem localhost)

1. Suba o projeto no GitHub.
2. No Vercel: **Add New > Project**.
3. Importe o repositório e defina:
   - `Root Directory`: `acadlab-webapp/backend`
4. Em **Environment Variables**, adicione:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_ORIGIN` (temporário pode ser `*`; depois troque para URL do frontend)
5. Deploy.
6. Copie a URL gerada (exemplo: `https://acadlab-backend.vercel.app`).

O backend já está preparado para Vercel com:
- `backend/api/index.js`
- `backend/vercel.json`

## 3) Deploy do frontend no Vercel

1. No Vercel: **Add New > Project** novamente.
2. Importe o mesmo repositório e defina:
   - `Root Directory`: `acadlab-webapp/frontend`
3. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = URL do backend Vercel (`https://...vercel.app`)
4. Deploy.
5. Copie a URL do frontend.

O frontend já está preparado para SPA no Vercel com:
- `frontend/vercel.json`

## 4) Ajuste final de CORS (recomendado)

1. Volte ao projeto do backend no Vercel.
2. Atualize `FRONTEND_ORIGIN` para a URL real do frontend (ex.: `https://acadlab-frontend.vercel.app`).
3. Faça redeploy do backend.

## Endpoints principais

- `GET /api/universidades`
- `GET /api/blocos?universidade_id=...`
- `GET /api/clientes?universidade_id=...&bloco_id=...`
- `GET /api/contratos?universidade_id=...`
- `GET /api/alertas/trabalhos?universidade_id=...`
- `GET /api/alertas/pagamentos?universidade_id=...`
- `GET /api/dashboard/summary?universidade_id=...`
- CRUD completo: `POST/PUT/DELETE` em `/api/universidades`, `/api/blocos`, `/api/clientes`, `/api/trabalhos`, `/api/pagamentos`, `/api/contratos`

## Automações entregues

- `valor_pendente` calculado automaticamente via coluna `generated`.
- Classificação automática de alertas de prazo (`normal`, `proximo`, `critico`, `atrasado`).
- Classificação automática de pagamentos (`quitado`, `pendente`, `atrasado`).
- Botão click-to-chat WhatsApp no dashboard (`https://wa.me/<numero>`).
- Módulo de contratos com impressão em formato A4, cálculo automático de total e salvamento para edição futura.
- Preenchimento automático no contrato ao selecionar cliente (curso, instituição, contacto e data atual).

## Logo para contratos

- Coloque o logo usado no contrato neste caminho:
  - `frontend/public/contrato/logo-contrato.png`
- Um guia foi adicionado em:
  - `frontend/public/contrato/README-logo-contrato.txt`

## Dados de teste incluídos

No SQL já entra:

- Universidade: `Universidade AcadLab Teste`
- Bloco: `Bloco A`
- Cliente: `Cliente Demo`
