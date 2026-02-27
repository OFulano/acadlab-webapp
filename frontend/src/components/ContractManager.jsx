import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const SERVICE_OPTIONS = [
  "Trabalho de Pesquisa",
  "Trabalho Pratico",
  "Projecto",
  "Monografia",
  "Artigo",
  "Dissertacao",
  "Forum",
  "Exame",
  "Avaliacao"
];

const todayIso = () => new Date().toISOString().slice(0, 10);
const yearNow = () => new Date().getFullYear();

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} MZN`;
const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  return `${day}/${month}/${year}`;
};

const escapeHtml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const generateRowId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const createEmptyItem = () => ({
  id_linha: generateRowId(),
  servico: SERVICE_OPTIONS[0],
  quantidade: 1,
  prazo_entrega: "",
  valor_unitario: 0,
  subtotal: 0
});

const createInitialForm = () => ({
  id: "",
  numero_contrato: `ALM-${yearNow()}-${String(Date.now()).slice(-6)}`,
  universidade_id: "",
  cliente_id: "",
  cliente_nome: "",
  curso: "",
  instituicao: "",
  contato: "",
  data_contrato: todayIso(),
  ano_referencia: yearNow(),
  itens: [createEmptyItem()],
  percentual_pagamento: 100,
  observacoes: "",
  assinatura: "Ass :"
});

const calculateTotals = (items) =>
  (items || []).reduce((acc, item) => acc + Number(item.subtotal || 0), 0);

const buildPrintHtml = (contrato) => {
  const rows = (contrato.itens || [])
    .map(
      (item, index) => `
      <tr>
        <td>${String(index + 1).padStart(2, "0")}</td>
        <td>${escapeHtml(item.servico)}</td>
        <td>${escapeHtml(item.quantidade)}</td>
        <td>${escapeHtml(item.prazo_entrega || "-")}</td>
        <td>${formatMoney(item.valor_unitario)}</td>
        <td>${formatMoney(item.subtotal)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="pt">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Contrato ${escapeHtml(contrato.numero_contrato)}</title>
<style>
  :root { --gold:#c9a84c; --navy:#0d1f3c; --light:#f4f7fc; --mid:#2a4070; --dark:#0a1628; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0d1f3c; font-family:Arial, sans-serif; padding:20px; }
  .page { width:210mm; min-height:297mm; background:var(--light); margin:0 auto; position:relative; box-shadow:0 10px 30px rgba(0,0,0,.25); }
  .content { padding:24px 32px; }
  .top-line { height:5px; background:linear-gradient(90deg, var(--navy), var(--gold), var(--navy)); margin-bottom:18px; }
  .header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(201,168,76,.35); padding-bottom:10px; }
  .logo-wrap { width:220px; height:56px; border:1px solid rgba(13,31,60,.2); border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .logo-wrap img { max-width:100%; max-height:100%; object-fit:contain; }
  .doc-title { text-align:right; font-size:12px; color:var(--mid); line-height:1.5; }
  h1 { font-size:18px; text-align:center; margin:14px 0 8px; color:var(--dark); }
  .partes { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:10px 0; }
  .box { border:1px solid rgba(201,168,76,.4); background:rgba(13,31,60,.04); padding:10px; border-radius:4px; }
  .label { font-size:10px; color:var(--gold); font-weight:bold; margin-bottom:4px; text-transform:uppercase; }
  .txt { font-size:12px; color:var(--mid); line-height:1.45; }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  th, td { border-bottom:1px solid rgba(13,31,60,.1); padding:7px 8px; text-align:left; font-size:12px; color:var(--mid); }
  thead th { background:var(--navy); color:#fff; font-size:11px; text-transform:uppercase; }
  .total td { font-weight:bold; color:var(--dark); background:rgba(13,31,60,.08); }
  .obs { margin-top:12px; padding:10px; border:1px solid rgba(201,168,76,.4); border-radius:4px; background:rgba(13,31,60,.04); }
  .obs h3 { font-size:11px; text-transform:uppercase; color:var(--gold); margin-bottom:6px; }
  .obs p { font-size:12px; color:var(--mid); line-height:1.5; min-height:42px; }
  .assinaturas { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:18px; }
  .sig { text-align:center; }
  .line { height:1px; background:#111827; margin:36px 0 6px; }
  .sig small { color:#6b7280; font-size:11px; }
  .foot { margin-top:12px; border-top:1px solid rgba(201,168,76,.35); padding-top:8px; font-size:11px; color:#6b7280; text-align:center; }
  @media print {
    body { background:#fff; padding:0; }
    .page { box-shadow:none; width:100%; min-height:100vh; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="content">
      <div class="top-line"></div>
      <div class="header">
        <div class="logo-wrap">
          <img src="${window.location.origin}/contrato/logo-contrato.png" alt="Logo contrato" />
        </div>
        <div class="doc-title">
          <div><strong>Contrato de Prestacao de Servicos</strong></div>
          <div>No ${escapeHtml(contrato.numero_contrato)} / ${escapeHtml(contrato.ano_referencia)}</div>
          <div>Data: ${escapeHtml(formatDate(contrato.data_contrato))}</div>
        </div>
      </div>

      <h1>Contrato de Prestacao de Servicos Academicos</h1>

      <div class="partes">
        <div class="box">
          <div class="label">Prestador de Servicos</div>
          <div class="txt">
            <strong>AcadLab Moz</strong><br />
            Fundada em 2019 - Nampula, Mocambique<br />
            Contacto: 864055649
          </div>
        </div>
        <div class="box">
          <div class="label">Cliente / Contratante</div>
          <div class="txt">
            <strong>${escapeHtml(contrato.cliente_nome || "-")}</strong><br />
            Curso: ${escapeHtml(contrato.curso || "-")}<br />
            Instituicao: ${escapeHtml(contrato.instituicao || "-")}<br />
            Contacto: ${escapeHtml(contrato.contato || "-")}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Servico Contratado</th>
            <th>Qtd.</th>
            <th>Prazo de Entrega</th>
            <th>Valor Unit. (MZN)</th>
            <th>Subtotal (MZN)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total">
            <td colspan="5" style="text-align:right">VALOR TOTAL</td>
            <td>${formatMoney(contrato.valor_total)}</td>
          </tr>
          <tr class="total">
            <td colspan="5" style="text-align:right">VALOR A PAGAR (100%)</td>
            <td>${formatMoney(contrato.valor_pagamento)}</td>
          </tr>
        </tbody>
      </table>

      <div class="obs">
        <h3>Observacoes / Negociacao</h3>
        <p>${escapeHtml(contrato.observacoes || "Sem observacoes.")}</p>
      </div>

      <div class="assinaturas">
        <div class="sig">
          <div class="line"></div>
          <div>${escapeHtml(contrato.assinatura || "Ass :")}</div>
          <small>Prestador de Servicos</small>
        </div>
        <div class="sig">
          <div class="line"></div>
          <div>Ass :</div>
          <small>Cliente / Contratante</small>
        </div>
      </div>

      <div class="foot">Formato A4 - Documento confidencial</div>
    </div>
  </div>
</body>
</html>`;
};

export default function ContractManager({ universities }) {
  const [form, setForm] = useState(createInitialForm());
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [saving, setSaving] = useState(false);

  const universidadeMap = useMemo(() => {
    const map = new Map();
    (universities || []).forEach((item) => map.set(item.id, item));
    return map;
  }, [universities]);

  useEffect(() => {
    if (!form.universidade_id && universities.length > 0) {
      setForm((prev) => ({ ...prev, universidade_id: universities[0].id, instituicao: universities[0].nome }));
    }
  }, [universities, form.universidade_id]);

  const loadData = async (universidadeId) => {
    if (!universidadeId) {
      setClientes([]);
      setContratos([]);
      return;
    }

    const [clientesData, contratosData] = await Promise.all([
      api.get("/api/clientes", { universidade_id: universidadeId }),
      api.get("/api/contratos", { universidade_id: universidadeId })
    ]);

    setClientes(clientesData);
    setContratos(contratosData);
  };

  useEffect(() => {
    loadData(form.universidade_id).catch((error) => {
      alert(`Erro ao carregar contratos: ${error.message}`);
    });
  }, [form.universidade_id]);

  const valorTotal = useMemo(() => calculateTotals(form.itens), [form.itens]);
  const valorPagamento = useMemo(() => Number((valorTotal * 1).toFixed(2)), [valorTotal]);

  const updateItem = (index, field, value) => {
    setForm((prev) => {
      const itens = [...prev.itens];
      const current = { ...itens[index], [field]: value };

      const quantidade = Number(current.quantidade || 0);
      const valorUnitario = Number(current.valor_unitario || 0);
      current.subtotal = Number((quantidade * valorUnitario).toFixed(2));

      itens[index] = current;
      return { ...prev, itens };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, itens: [...prev.itens, createEmptyItem()] }));
  };

  const removeItem = (idLinha) => {
    setForm((prev) => {
      const filtered = prev.itens.filter((item) => item.id_linha !== idLinha);
      return { ...prev, itens: filtered.length > 0 ? filtered : [createEmptyItem()] };
    });
  };

  const handleClientSelect = (clienteId) => {
    const cliente = clientes.find((item) => item.id === clienteId);
    const uni = universidadeMap.get(form.universidade_id);

    setForm((prev) => ({
      ...prev,
      cliente_id: clienteId,
      cliente_nome: cliente?.nome || "",
      curso: cliente?.curso || "",
      contato: cliente?.contato || "",
      instituicao: uni?.nome || ""
    }));
  };

  const clearForm = () => {
    const uni = universidadeMap.get(form.universidade_id);
    setForm({
      ...createInitialForm(),
      universidade_id: form.universidade_id,
      instituicao: uni?.nome || ""
    });
  };

  const buildPayload = () => ({
    cliente_id: form.cliente_id,
    universidade_id: form.universidade_id,
    numero_contrato: form.numero_contrato,
    data_contrato: form.data_contrato,
    ano_referencia: form.ano_referencia,
    curso: form.curso,
    instituicao: form.instituicao,
    contato: form.contato,
    itens: form.itens,
    valor_total: Number(valorTotal.toFixed(2)),
    percentual_pagamento: 100,
    observacoes: form.observacoes,
    assinatura: form.assinatura || "Ass :"
  });

  const saveContrato = async ({ silent = false } = {}) => {
    if (!form.universidade_id || !form.cliente_id) {
      alert("Selecione universidade e cliente antes de salvar.");
      return null;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      const saved = form.id
        ? await api.put(`/api/contratos/${form.id}`, payload)
        : await api.post("/api/contratos", payload);

      const uni = universidadeMap.get(form.universidade_id);
      setForm((prev) => ({
        ...prev,
        id: saved.id,
        instituicao: uni?.nome || prev.instituicao
      }));

      await loadData(form.universidade_id);
      if (!silent) alert("Contrato guardado com sucesso.");
      return saved;
    } catch (error) {
      alert(`Falha ao guardar contrato: ${error.message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const openPrint = (source) => {
    const popup = window.open("", "_blank", "width=1000,height=900");
    if (!popup) {
      alert("Permita popups no navegador para imprimir o contrato.");
      return;
    }

    popup.document.write(buildPrintHtml(source));
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const saveAndPrint = async () => {
    const saved = await saveContrato({ silent: true });
    if (!saved) return;

    const cliente = clientes.find((item) => item.id === form.cliente_id);
    const payload = {
      ...buildPayload(),
      id: saved.id,
      cliente_nome: cliente?.nome || form.cliente_nome,
      valor_pagamento: Number(valorPagamento.toFixed(2))
    };

    openPrint(payload);
  };

  const editContrato = (contrato) => {
    setForm({
      id: contrato.id,
      numero_contrato: contrato.numero_contrato,
      universidade_id: contrato.universidade_id,
      cliente_id: contrato.cliente_id,
      cliente_nome: contrato.cliente_nome || "",
      curso: contrato.curso || contrato.cliente_curso || "",
      instituicao: contrato.instituicao || contrato.universidade_nome || "",
      contato: contrato.contato || contrato.cliente_contato || "",
      data_contrato: contrato.data_contrato,
      ano_referencia: contrato.ano_referencia,
      itens: Array.isArray(contrato.itens) && contrato.itens.length > 0 ? contrato.itens : [createEmptyItem()],
      percentual_pagamento: contrato.percentual_pagamento || 100,
      observacoes: contrato.observacoes || "",
      assinatura: contrato.assinatura || "Ass :"
    });
  };

  const printFromSaved = (contrato) => {
    openPrint({
      ...contrato,
      curso: contrato.curso || contrato.cliente_curso,
      instituicao: contrato.instituicao || contrato.universidade_nome,
      contato: contrato.contato || contrato.cliente_contato,
      valor_pagamento: contrato.valor_pagamento || contrato.valor_total
    });
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-4xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
      <h2 className="text-lg font-semibold text-slate-900">Criar Contrato</h2>
      <p className="mt-1 text-xs text-slate-600">
        Logo do contrato: coloque a imagem em <code>frontend/public/contrato/logo-contrato.png</code>.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Universidade</label>
          <select
            className="input"
            value={form.universidade_id}
            onChange={(e) => {
              const uniId = e.target.value;
              const uni = universidadeMap.get(uniId);
              setForm((prev) => ({
                ...prev,
                universidade_id: uniId,
                instituicao: uni?.nome || "",
                cliente_id: "",
                cliente_nome: "",
                curso: "",
                contato: ""
              }));
            }}
          >
            <option value="">Selecione...</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Cliente contratante</label>
          <select className="input" value={form.cliente_id} onChange={(e) => handleClientSelect(e.target.value)}>
            <option value="">Selecione...</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Numero do contrato</label>
          <input
            className="input"
            value={form.numero_contrato}
            onChange={(e) => setForm((prev) => ({ ...prev, numero_contrato: e.target.value }))}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Curso</label>
          <input className="input" value={form.curso} readOnly />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Instituicao</label>
          <input className="input" value={form.instituicao} readOnly />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Contacto</label>
          <input className="input" value={form.contato} readOnly />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
            <input
              type="date"
              className="input"
              value={form.data_contrato}
              onChange={(e) => setForm((prev) => ({ ...prev, data_contrato: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ano</label>
            <input className="input" value={form.ano_referencia} readOnly />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-900">Servicos contratados</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-left text-slate-600">
                <th className="px-2 py-2">Servico</th>
                <th className="px-2 py-2">Qtd.</th>
                <th className="px-2 py-2">Prazo</th>
                <th className="px-2 py-2">Valor Unit.</th>
                <th className="px-2 py-2">Subtotal</th>
                <th className="px-2 py-2">Acao</th>
              </tr>
            </thead>
            <tbody>
              {form.itens.map((item, index) => (
                <tr key={item.id_linha} className="border-b border-slate-100">
                  <td className="px-2 py-2">
                    <select
                      className="input"
                      value={item.servico}
                      onChange={(e) => updateItem(index, "servico", e.target.value)}
                    >
                      {SERVICE_OPTIONS.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="1"
                      className="input"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, "quantidade", Number(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      className="input"
                      value={item.prazo_entrega || ""}
                      onChange={(e) => updateItem(index, "prazo_entrega", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={item.valor_unitario}
                      onChange={(e) => updateItem(index, "valor_unitario", Number(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-2 font-semibold text-slate-700">{formatMoney(item.subtotal)}</td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                      onClick={() => removeItem(item.id_linha)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={addItem}>
            Adicionar linha
          </button>
          <button type="button" className="btn-muted" onClick={clearForm}>
            Novo contrato
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-sm text-slate-600">Valor total</p>
          <p className="text-xl font-bold text-slate-900">{formatMoney(valorTotal)}</p>
          <p className="mt-2 text-sm text-slate-600">Valor a pagar (100%)</p>
          <p className="text-xl font-bold text-brand-700">{formatMoney(valorPagamento)}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Observacoes / negociacao</label>
          <textarea
            className="input min-h-28"
            value={form.observacoes}
            onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Escreva observacoes para negociacao com o cliente."
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary" disabled={saving} onClick={() => saveContrato()}>
          {saving ? "Guardando..." : "Guardar contrato"}
        </button>
        <button type="button" className="btn-muted" disabled={saving} onClick={saveAndPrint}>
          Guardar e imprimir A4
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-slate-900">Contratos guardados</h3>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-left text-slate-600">
                <th className="px-3 py-2">Numero</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((contrato) => (
                <tr key={contrato.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium">{contrato.numero_contrato}</td>
                  <td className="px-3 py-2">{contrato.cliente_nome}</td>
                  <td className="px-3 py-2">{formatDate(contrato.data_contrato)}</td>
                  <td className="px-3 py-2">{formatMoney(contrato.valor_total)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-amber-500 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
                        onClick={() => editContrato(contrato)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700"
                        onClick={() => printFromSaved(contrato)}
                      >
                        Imprimir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contratos.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={5}>
                    Nenhum contrato guardado para esta universidade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
