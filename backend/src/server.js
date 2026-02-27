import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabaseClient.js";
import { applyFilters, normalizePhone, parseNumber } from "./helpers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(
  cors({
    origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN
  })
);
app.use(express.json());

const handleDbError = (res, error) => {
  console.error(error);
  return res.status(400).json({ error: error.message || "Erro ao processar operação." });
};

const attachCrudRoutes = ({ path, tableName, preprocessPayload }) => {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      let query = supabase.from(tableName).select("*");
      query = applyFilters(query, req.query);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) return handleDbError(res, error);
      return res.json(data);
    } catch (error) {
      return handleDbError(res, error);
    }
  });

  app.get(`/api/${path}/:id`, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", req.params.id)
        .single();

      if (error) return handleDbError(res, error);
      return res.json(data);
    } catch (error) {
      return handleDbError(res, error);
    }
  });

  app.post(`/api/${path}`, async (req, res) => {
    try {
      const payload = preprocessPayload ? preprocessPayload(req.body) : req.body;
      const { data, error } = await supabase.from(tableName).insert(payload).select().single();

      if (error) return handleDbError(res, error);
      return res.status(201).json(data);
    } catch (error) {
      return handleDbError(res, error);
    }
  });

  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      const payload = preprocessPayload ? preprocessPayload(req.body, true) : req.body;
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq("id", req.params.id)
        .select()
        .single();

      if (error) return handleDbError(res, error);
      return res.json(data);
    } catch (error) {
      return handleDbError(res, error);
    }
  });

  app.delete(`/api/${path}/:id`, async (req, res) => {
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", req.params.id);
      if (error) return handleDbError(res, error);
      return res.status(204).send();
    } catch (error) {
      return handleDbError(res, error);
    }
  });
};

attachCrudRoutes({
  path: "universidades",
  tableName: "universidades"
});

attachCrudRoutes({
  path: "blocos",
  tableName: "blocos"
});

attachCrudRoutes({
  path: "clientes",
  tableName: "clientes",
  preprocessPayload: (body) => ({
    ...body,
    contato: normalizePhone(body.contato || "")
  })
});

attachCrudRoutes({
  path: "trabalhos",
  tableName: "trabalhos",
  preprocessPayload: (body) => ({
    ...body,
    valor: parseNumber(body.valor, 0)
  })
});

attachCrudRoutes({
  path: "pagamentos",
  tableName: "pagamentos",
  preprocessPayload: (body) => ({
    ...body,
    valor_total: parseNumber(body.valor_total, 0),
    valor_pago: parseNumber(body.valor_pago, 0)
    // valor_pendente é calculado automaticamente no banco.
  })
});

app.get("/api/dashboard/summary", async (req, res) => {
  const universidadeId = req.query.universidade_id;
  const blocoId = req.query.bloco_id;

  try {
    let clientesQuery = supabase.from("clientes").select("id, status, universidade_id, bloco_id");
    let trabalhosQuery = supabase
      .from("vw_trabalhos_alerta")
      .select("id, status, nivel_alerta, universidade_id, bloco_id, prazo, cliente_nome, tipo_trabalho")
      .order("prazo", { ascending: true });
    let pagamentosQuery = supabase
      .from("vw_pagamentos_alerta")
      .select("id, valor_pendente, status_pagamento, nivel_alerta, universidade_id, bloco_id, cliente_nome, data_pagamento")
      .order("created_at", { ascending: false });

    if (universidadeId) {
      clientesQuery = clientesQuery.eq("universidade_id", universidadeId);
      trabalhosQuery = trabalhosQuery.eq("universidade_id", universidadeId);
      pagamentosQuery = pagamentosQuery.eq("universidade_id", universidadeId);
    }

    if (blocoId) {
      clientesQuery = clientesQuery.eq("bloco_id", blocoId);
      trabalhosQuery = trabalhosQuery.eq("bloco_id", blocoId);
      pagamentosQuery = pagamentosQuery.eq("bloco_id", blocoId);
    }

    const [{ data: clientes, error: clientesError }, { data: trabalhos, error: trabalhosError }, { data: pagamentos, error: pagamentosError }] =
      await Promise.all([clientesQuery, trabalhosQuery, pagamentosQuery]);

    if (clientesError) return handleDbError(res, clientesError);
    if (trabalhosError) return handleDbError(res, trabalhosError);
    if (pagamentosError) return handleDbError(res, pagamentosError);

    const resumo = {
      clientes_ativos: clientes.filter((c) => c.status === "ativo").length,
      clientes_inativos: clientes.filter((c) => c.status === "inativo").length,
      trabalhos_andamento: trabalhos.filter((t) => t.status === "em_andamento").length,
      trabalhos_alerta: trabalhos.filter((t) => ["critico", "atrasado"].includes(t.nivel_alerta)).length,
      pagamentos_pendentes: pagamentos.filter((p) => p.status_pagamento === "pendente").length,
      pagamentos_atrasados: pagamentos.filter((p) => p.status_pagamento === "atrasado").length
    };

    return res.json({
      resumo,
      trabalhos: trabalhos.slice(0, 20),
      pagamentos: pagamentos.slice(0, 20)
    });
  } catch (error) {
    return handleDbError(res, error);
  }
});

app.get("/api/alertas/trabalhos", async (req, res) => {
  try {
    let query = supabase.from("vw_trabalhos_alerta").select("*").order("prazo", { ascending: true });
    query = applyFilters(query, {
      universidade_id: req.query.universidade_id,
      bloco_id: req.query.bloco_id,
      tipo_trabalho: req.query.tipo_trabalho,
      status: req.query.status,
      nivel_alerta: req.query.nivel_alerta
    });

    const { data, error } = await query;
    if (error) return handleDbError(res, error);
    return res.json(data);
  } catch (error) {
    return handleDbError(res, error);
  }
});

app.get("/api/alertas/pagamentos", async (req, res) => {
  try {
    let query = supabase.from("vw_pagamentos_alerta").select("*").order("created_at", { ascending: false });
    query = applyFilters(query, {
      universidade_id: req.query.universidade_id,
      bloco_id: req.query.bloco_id,
      status_pagamento: req.query.status_pagamento,
      nivel_alerta: req.query.nivel_alerta
    });

    const { data, error } = await query;
    if (error) return handleDbError(res, error);
    return res.json(data);
  } catch (error) {
    return handleDbError(res, error);
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "acadlab-backend", timestamp: new Date().toISOString() });
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`API AcadLab ativa em http://localhost:${PORT}`);
  });
}

export default app;
