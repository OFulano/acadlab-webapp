import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { ConfirmPopup, NoticeToast } from "./PrettyPopup";

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
        <td>${escapeHtml(item.prazo_entrega ? formatDate(item.prazo_entrega) : "-")}</td>
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
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --gold: #c9a84c;
    --gold-light: #e2c06a;
    --gold-pale: #f5edd4;
    --navy: #0d1f3c;
    --mid: #2a4070;
    --dark: #0a1628;
    --light: #f4f7fc;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d1f3c;
    font-family: "Jost", sans-serif;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 20px;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    background: var(--light);
    position: relative;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
    overflow: hidden;
  }
  .bg-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.06) 1px, transparent 0);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .watermark {
    position: absolute;
    top: 52%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-family: "Cormorant Garamond", serif;
    font-size: 82px;
    font-weight: 700;
    color: rgba(13, 31, 60, 0.05);
    letter-spacing: 8px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .accent-strip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--navy), var(--gold), var(--navy));
  }
  .corner { position: absolute; width: 52px; height: 52px; }
  .corner-tl { top: 16px; left: 16px; border-top: 2px solid var(--gold); border-left: 2px solid var(--gold); }
  .corner-tr { top: 16px; right: 16px; border-top: 2px solid var(--gold); border-right: 2px solid var(--gold); }
  .corner-bl { bottom: 16px; left: 16px; border-bottom: 2px solid var(--gold); border-left: 2px solid var(--gold); }
  .corner-br { bottom: 16px; right: 16px; border-bottom: 2px solid var(--gold); border-right: 2px solid var(--gold); }
  .content {
    position: relative;
    z-index: 2;
    padding: 28px 36px 24px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(201, 168, 76, 0.35);
    padding-bottom: 10px;
    margin-bottom: 12px;
  }
  .logo-wrap {
    width: 360px;
    height: 84px;
    border: 1px solid rgba(13, 31, 60, 0.2);
    border-radius: 8px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .logo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transform: scale(1.42);
    transform-origin: center;
  }
  .doc-info { text-align: right; }
  .doc-title {
    font-family: "Cormorant Garamond", serif;
    font-size: 14px;
    color: var(--gold);
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
  }
  .doc-row {
    font-size: 10px;
    color: #7b8494;
    margin-top: 2px;
  }
  h1 {
    font-family: "Cormorant Garamond", serif;
    font-size: 30px;
    text-align: center;
    color: var(--dark);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 10px 0;
  }
  .section-label {
    font-size: 9px;
    letter-spacing: 2.3px;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 600;
    margin-bottom: 6px;
    margin-top: 10px;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }
  .party-box {
    background: rgba(13, 31, 60, 0.04);
    border: 1px solid rgba(201, 168, 76, 0.28);
    border-radius: 4px;
    padding: 10px 12px;
    min-height: 92px;
  }
  .party-label {
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 600;
    margin-bottom: 5px;
  }
  .party-name {
    font-family: "Cormorant Garamond", serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--dark);
    margin-bottom: 4px;
  }
  .party-detail {
    font-size: 10px;
    color: var(--mid);
    line-height: 1.45;
  }
  .services-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
  }
  .services-table thead th {
    background: var(--navy);
    color: var(--gold-light);
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-align: left;
    padding: 6px 8px;
  }
  .services-table tbody td {
    border-bottom: 1px solid rgba(13, 31, 60, 0.12);
    padding: 6px 8px;
    color: var(--mid);
    font-size: 11px;
  }
  .services-table tbody tr:nth-child(even) { background: rgba(13, 31, 60, 0.03); }
  .services-table .total-row td {
    background: rgba(13, 31, 60, 0.08);
    font-weight: 600;
    color: var(--dark);
  }
  .clauses-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    margin-top: 8px;
  }
  .clause {
    padding: 8px 10px;
    border-left: 2px solid var(--gold);
    background: rgba(13, 31, 60, 0.04);
  }
  .clause-title {
    font-size: 8px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 600;
    margin-bottom: 3px;
  }
  .clause p {
    font-size: 10px;
    color: var(--mid);
    line-height: 1.45;
  }
  .obs {
    margin-top: 10px;
    background: rgba(13, 31, 60, 0.04);
    border: 1px solid rgba(201, 168, 76, 0.3);
    border-radius: 4px;
    padding: 8px 10px;
  }
  .obs h3 {
    font-size: 8px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 3px;
  }
  .obs p {
    font-size: 10px;
    color: var(--mid);
    min-height: 36px;
    line-height: 1.45;
  }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 14px;
  }
  .sig { text-align: center; }
  .sig-space { height: 24px; }
  .sig-line { width: 100%; height: 1px; background: #1f2937; margin-bottom: 4px; }
  .sig-name {
    font-family: "Cormorant Garamond", serif;
    font-size: 13px;
    color: var(--dark);
    font-weight: 600;
  }
  .sig-role {
    font-size: 8px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #8c93a0;
  }
  .footer {
    margin-top: 10px;
    border-top: 1px solid rgba(201, 168, 76, 0.3);
    padding-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    color: #8d94a2;
  }
  .footer-brand {
    font-family: "Cormorant Garamond", serif;
    color: var(--gold);
    font-size: 10px;
    font-style: italic;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .page { box-shadow: none; width: 100%; min-height: 100vh; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="bg-pattern"></div>
    <div class="watermark">Confidencial</div>
    <div class="accent-strip"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="content">
      <div class="header">
        <div class="logo-wrap">
          <img src="${window.location.origin}/contrato/logo-contrato.png" alt="Logo contrato" />
        </div>
        <div class="doc-info">
          <div class="doc-title">Contrato de Servi&ccedil;os</div>
          <div class="doc-row">N.º ${escapeHtml(contrato.numero_contrato)} / ${escapeHtml(contrato.ano_referencia)}</div>
          <div class="doc-row">Data: ${escapeHtml(formatDate(contrato.data_contrato))}</div>
        </div>
      </div>

      <h1>Contrato de Presta&ccedil;&atilde;o de Servi&ccedil;os Acad&eacute;micos</h1>

      <div class="section-label">Partes Contratantes</div>
      <div class="parties">
        <div class="party-box">
          <div class="party-label">Prestador de Servi&ccedil;os</div>
          <div class="party-name">AcadLab Moz</div>
          <div class="party-detail">
            Fundada em 2019 - Nampula, Mo&ccedil;ambique<br />
            Especialista em produ&ccedil;&atilde;o cient&iacute;fica e suporte acad&eacute;mico<br />
            Contacto: 864 055 649
          </div>
        </div>
        <div class="party-box">
          <div class="party-label">Cliente / Contratante</div>
          <div class="party-name">${escapeHtml(contrato.cliente_nome || "-")}</div>
          <div class="party-detail">
            Curso: ${escapeHtml(contrato.curso || "-")}<br />
            Institui&ccedil;&atilde;o: ${escapeHtml(contrato.instituicao || "-")}<br />
            Contacto: ${escapeHtml(contrato.contato || "-")}
          </div>
        </div>
      </div>

      <div class="section-label">Descri&ccedil;&atilde;o dos Servi&ccedil;os</div>
      <table class="services-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Servi&ccedil;o Contratado</th>
            <th>Qtd.</th>
            <th>Prazo de Entrega</th>
            <th>Valor Unit. (MZN)</th>
            <th>Subtotal (MZN)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="5" style="text-align:right">VALOR TOTAL</td>
            <td>${formatMoney(contrato.valor_total)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="5" style="text-align:right">VALOR A PAGAR (100%)</td>
            <td>${formatMoney(contrato.valor_pagamento)}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-label">Cl&aacute;usulas e Condi&ccedil;&otilde;es</div>
      <div class="clauses-grid">
        <div class="clause">
          <div class="clause-title">Cl&aacute;usula I - Pagamento</div>
          <p>O pagamento ser&aacute; efectuado conforme acordado: <strong>${Number(
            contrato.percentual_pagamento || 100
          ).toFixed(0)}%</strong> no acto da contrata&ccedil;&atilde;o e o remanescente na entrega. Meios aceites: M-Pesa, e-Mola e Transfer&ecirc;ncia Banc&aacute;ria.</p>
        </div>
        <div class="clause">
          <div class="clause-title">Cl&aacute;usula II - Confidencialidade</div>
          <p>A AcadLab Moz compromete-se a manter total sigilo sobre os dados, conte&uacute;dos e informa&ccedil;&otilde;es fornecidos pelo cliente, n&atilde;o os divulgando a terceiros.</p>
        </div>
        <div class="clause">
          <div class="clause-title">Cl&aacute;usula III - Revis&otilde;es</div>
          <p>O cliente tem direito a revis&otilde;es sem custo adicional, desde que dentro do escopo original acordado. Normas aplicadas: APA, ABNT, Vancouver ou outra solicitada.</p>
        </div>
        <div class="clause">
          <div class="clause-title">Cl&aacute;usula IV - Propriedade e Uso</div>
          <p>Ap&oacute;s quita&ccedil;&atilde;o total, o material produzido &eacute; de uso exclusivo do cliente. A AcadLab Moz reserva-se o direito de utilizar o trabalho como portf&oacute;lio an&oacute;nimo.</p>
        </div>
        <div class="clause">
          <div class="clause-title">Cl&aacute;usula V - Cancelamento</div>
          <p>Em caso de cancelamento pelo cliente ap&oacute;s in&iacute;cio dos trabalhos, o valor da fase executada ser&aacute; retido. Cancelamentos antes do in&iacute;cio ter&atilde;o reembolso integral.</p>
        </div>
        <div class="clause">
          <div class="clause-title">Cl&aacute;usula VI - Rigor e Qualidade</div>
          <p>Todos os trabalhos s&atilde;o executados com rigor cient&iacute;fico, &eacute;tica profissional e alinhados &agrave;s exig&ecirc;ncias institucionais, garantindo resultados de alta qualidade acad&eacute;mica.</p>
        </div>
      </div>

      <div class="obs">
        <h3>Observa&ccedil;&otilde;es / Negocia&ccedil;&atilde;o</h3>
        <p>${escapeHtml(contrato.observacoes || "Sem observa\u00E7\u00F5es.")}</p>
      </div>

      <div class="section-label">Assinaturas</div>
      <div class="signatures">
        <div class="sig">
          <div class="sig-space"></div>
          <div class="sig-line"></div>
          <div class="sig-name">Ass.: ________________________________</div>
          <div class="sig-role">Prestador de Servi&ccedil;os</div>
        </div>
        <div class="sig">
          <div class="sig-space"></div>
          <div class="sig-line"></div>
          <div class="sig-name">Ass.: ________________________________</div>
          <div class="sig-role">Cliente / Contratante</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand">AcadLab Moz - O Seu Sucesso &eacute; a Nossa Tese.</div>
        <div>Nampula - Mo&ccedil;ambique - Fundada 2019</div>
        <div>P&aacute;g. 1 / 1</div>
      </div>
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
  const [notice, setNotice] = useState(null);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showNotice = (type, message) => {
    setNotice({ type, message, ts: Date.now() });
  };

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

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

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
      showNotice("error", `Erro ao carregar contratos: ${error.message}`);
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
      showNotice("warn", "Selecione universidade e cliente antes de salvar.");
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
      if (!silent) showNotice("success", "Contrato guardado com sucesso.");
      return saved;
    } catch (error) {
      showNotice("error", `Falha ao guardar contrato: ${error.message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const openPrint = (source) => {
    const popup = window.open("", "_blank", "width=1000,height=900");
    if (!popup) {
      showNotice("warn", "Permita popups no navegador para imprimir o contrato.");
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

  const deleteContrato = async (contrato) => {
    if (!contrato) return;
    try {
      setDeleting(true);
      await api.delete(`/api/contratos/${contrato.id}`);
      if (form.id === contrato.id) {
        clearForm();
      }
      await loadData(form.universidade_id);
      showNotice("success", `Contrato ${contrato.numero_contrato} apagado com sucesso.`);
      setContractToDelete(null);
    } catch (error) {
      showNotice("error", `Falha ao apagar contrato: ${error.message}`);
    } finally {
      setDeleting(false);
    }
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Número do contrato</label>
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Instituição</label>
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
        <p className="text-sm font-semibold text-slate-900">Serviços contratados</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-left text-slate-600">
                <th className="px-2 py-2">Serviço</th>
                <th className="px-2 py-2">Qtd.</th>
                <th className="px-2 py-2">Prazo</th>
                <th className="px-2 py-2">Valor Unit.</th>
                <th className="px-2 py-2">Subtotal</th>
                <th className="px-2 py-2">Ação</th>
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Observações / negociação</label>
          <textarea
            className="input min-h-28"
            value={form.observacoes}
            onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Escreva observações para negociação com o cliente."
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
                <th className="px-3 py-2">Número</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Ações</th>
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
                      <button
                        type="button"
                        className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                        onClick={() => setContractToDelete(contrato)}
                      >
                        Apagar
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

      <NoticeToast notice={notice} onClose={() => setNotice(null)} />
      <ConfirmPopup
        open={Boolean(contractToDelete)}
        title="Apagar contrato"
        message={
          contractToDelete
            ? `Tem certeza que pretende apagar o contrato ${contractToDelete.numero_contrato}?`
            : ""
        }
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        loading={deleting}
        onCancel={() => setContractToDelete(null)}
        onConfirm={() => deleteContrato(contractToDelete)}
      />
    </div>
  );
}
