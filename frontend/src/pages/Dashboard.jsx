import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import MetricCard from "../components/MetricCard";
import StatusPill from "../components/StatusPill";
import WhatsAppLink from "../components/WhatsAppLink";
import { ConfirmPopup, NoticeToast } from "../components/PrettyPopup";

const initialForms = {
  bloco: { nome: "", descricao: "", valor_base: "" },
  cliente: { nome: "", curso: "", tipo: "normal", contato: "", bloco_id: "", status: "ativo", data_entrada: "" },
  trabalho: { cliente_id: "", tipo_trabalho: "forum", prazo: "", status: "pendente", valor: "", observacoes: "" },
  pagamento: { cliente_id: "", valor_total: "", valor_pago: "", data_pagamento: "", metodo: "", observacoes: "" }
};

export default function Dashboard({ university, onBack }) {
  const [forms, setForms] = useState(initialForms);
  const [filters, setFilters] = useState({ bloco_id: "", cliente_id: "", tipo_trabalho: "", status_pagamento: "" });
  const [blocos, setBlocos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [trabalhos, setTrabalhos] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [resumo, setResumo] = useState({
    clientes_ativos: 0,
    clientes_inativos: 0,
    trabalhos_andamento: 0,
    trabalhos_alerta: 0,
    pagamentos_pendentes: 0,
    pagamentos_atrasados: 0
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("");
  const [notice, setNotice] = useState(null);
  const [editingClientId, setEditingClientId] = useState("");
  const [editingClient, setEditingClient] = useState({
    nome: "",
    curso: "",
    tipo: "",
    contato: "",
    status: "ativo",
    bloco_id: ""
  });
  const [clientToDelete, setClientToDelete] = useState(null);
  const [savingClient, setSavingClient] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);

  const menuItems = [{ id: "gerir_clientes", label: "Gerir Utilizadores" }];

  const showNotice = (type, message) => {
    setNotice({ type, message, ts: Date.now() });
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const formChange = (entity, field, value) => {
    setForms((prev) => ({ ...prev, [entity]: { ...prev[entity], [field]: value } }));
  };

  const loadAll = async () => {
    const params = { universidade_id: university.id, bloco_id: filters.bloco_id || undefined };

    const [blocosData, clientesData, trabalhosData, pagamentosData, summaryData] = await Promise.all([
      api.get("/api/blocos", { universidade_id: university.id }),
      api.get("/api/clientes", {
        universidade_id: university.id,
        bloco_id: filters.bloco_id || undefined
      }),
      api.get("/api/alertas/trabalhos", {
        universidade_id: university.id,
        bloco_id: filters.bloco_id || undefined,
        tipo_trabalho: filters.tipo_trabalho || undefined
      }),
      api.get("/api/alertas/pagamentos", {
        universidade_id: university.id,
        bloco_id: filters.bloco_id || undefined,
        status_pagamento: filters.status_pagamento || undefined
      }),
      api.get("/api/dashboard/summary", params)
    ]);

    setBlocos(blocosData);
    setClientes(clientesData);
    setTrabalhos(trabalhosData);
    setPagamentos(pagamentosData);
    setResumo(summaryData.resumo);
  };

  useEffect(() => {
    loadAll().catch((error) => {
      alert(`Erro ao carregar dashboard: ${error.message}`);
    });
  }, [university.id, filters.bloco_id, filters.tipo_trabalho, filters.status_pagamento]);

  const filteredClientes = useMemo(() => {
    if (!filters.cliente_id) return clientes;
    return clientes.filter((item) => item.id === filters.cliente_id);
  }, [clientes, filters.cliente_id]);

  const submitForm = async (entity, path, payload) => {
    await api.post(path, payload);
    setForms((prev) => ({ ...prev, [entity]: initialForms[entity] }));
    await loadAll();
  };

  const openClientEditor = (client) => {
    setEditingClientId(client.id);
    setEditingClient({
      nome: client.nome || "",
      curso: client.curso || "",
      tipo: client.tipo || "",
      contato: client.contato || "",
      status: client.status || "ativo",
      bloco_id: client.bloco_id || ""
    });
  };

  const cancelClientEditor = () => {
    setEditingClientId("");
    setEditingClient({
      nome: "",
      curso: "",
      tipo: "",
      contato: "",
      status: "ativo",
      bloco_id: ""
    });
  };

  const saveClientUpdate = async () => {
    if (!editingClientId) return;
    if (
      !editingClient.nome.trim() ||
      !editingClient.curso.trim() ||
      !editingClient.tipo.trim() ||
      !editingClient.contato.trim() ||
      !editingClient.bloco_id
    ) {
      showNotice("warn", "Preencha os campos obrigatórios do cliente.");
      return;
    }

    try {
      setSavingClient(true);
      await api.put(`/api/clientes/${editingClientId}`, {
        ...editingClient,
        universidade_id: university.id,
        data_entrada: new Date().toISOString().slice(0, 10)
      });
      await loadAll();
      cancelClientEditor();
      showNotice("success", "Cliente actualizado com sucesso.");
    } catch (error) {
      showNotice("error", `Falha ao actualizar cliente: ${error.message}`);
    } finally {
      setSavingClient(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      setDeletingClient(true);
      await api.delete(`/api/clientes/${clientToDelete.id}`);
      await loadAll();
      showNotice("success", `Cliente ${clientToDelete.nome} eliminado com sucesso.`);
      setClientToDelete(null);
      if (editingClientId === clientToDelete.id) {
        cancelClientEditor();
      }
    } catch (error) {
      showNotice("error", `Falha ao eliminar cliente: ${error.message}`);
    } finally {
      setDeletingClient(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-4 md:px-8 md:py-8">
      <header className="relative mb-5 flex flex-col gap-3 rounded-2xl bg-brand-900 p-4 text-white md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
          <div className="rounded-xl border border-white/20 bg-white p-1 shadow-sm">
            <img
              src="/logo-acadlab.png"
              alt="Logo AcadLab Moz"
              className="h-14 w-52 rounded-lg object-cover object-center md:h-16 md:w-64"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-100">Dashboard</p>
            <h1 className="text-2xl font-bold">{university.nome}</h1>
          </div>
        </div>

        <div className="relative mx-auto flex items-center gap-2 md:mx-0">
          <button className="btn-muted" onClick={onBack}>
            Trocar universidade
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {"\u2630"} Menu
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-slate-200 bg-white p-2 text-left shadow-xl">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`mb-1 w-full rounded-lg px-3 py-2 text-sm ${
                    activePanel === item.id
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  onClick={() => {
                    setActivePanel(item.id);
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {activePanel === "gerir_clientes" && (
        <section className="card mb-5 p-4 text-left">
          <h2 className="text-lg font-semibold text-slate-900">Gerir Utilizadores</h2>
          <p className="mt-1 text-sm text-slate-600">Aqui pode editar, actualizar e apagar clientes já registados.</p>
          <div className="mt-3 space-y-2">
            {clientes.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.nome}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Curso: {item.curso} | Status: {item.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    onClick={() => openClientEditor(item)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                    onClick={() => setClientToDelete(item)}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
          {editingClientId && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-base font-semibold text-slate-900">Actualizar cliente</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <input
                  className="input"
                  placeholder="Nome"
                  value={editingClient.nome}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, nome: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Curso"
                  value={editingClient.curso}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, curso: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Tipo"
                  value={editingClient.tipo}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, tipo: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Contacto"
                  value={editingClient.contato}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, contato: e.target.value }))}
                />
                <select
                  className="input"
                  value={editingClient.status}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
                <select
                  className="input"
                  value={editingClient.bloco_id}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, bloco_id: e.target.value }))}
                >
                  <option value="">Escolha o bloco...</option>
                  {blocos.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                  onClick={cancelClientEditor}
                  disabled={savingClient}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  onClick={saveClientUpdate}
                  disabled={savingClient}
                >
                  {savingClient ? "A processar..." : "Actualizar"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard title="Clientes ativos" value={resumo.clientes_ativos} tone="good" />
        <MetricCard title="Clientes inativos" value={resumo.clientes_inativos} />
        <MetricCard title="Trabalhos em andamento" value={resumo.trabalhos_andamento} tone="warn" />
        <MetricCard title="Trabalhos críticos" value={resumo.trabalhos_alerta} tone="danger" />
        <MetricCard title="Pagamentos pendentes" value={resumo.pagamentos_pendentes} tone="warn" />
        <MetricCard title="Pagamentos atrasados" value={resumo.pagamentos_atrasados} tone="danger" />
      </section>

      <section className="card mt-5 p-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <select className="input" value={filters.bloco_id} onChange={(e) => setFilters((v) => ({ ...v, bloco_id: e.target.value }))}>
            <option value="">Todos os blocos</option>
            {blocos.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>

          <select className="input" value={filters.cliente_id} onChange={(e) => setFilters((v) => ({ ...v, cliente_id: e.target.value }))}>
            <option value="">Todos os clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filters.tipo_trabalho}
            onChange={(e) => setFilters((v) => ({ ...v, tipo_trabalho: e.target.value }))}
          >
            <option value="">Todos os trabalhos</option>
            <option value="forum">Forum</option>
            <option value="avaliacao">Avaliação</option>
            <option value="exame">Exame</option>
          </select>

          <select
            className="input"
            value={filters.status_pagamento}
            onChange={(e) => setFilters((v) => ({ ...v, status_pagamento: e.target.value }))}
          >
            <option value="">Todos os pagamentos</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Atrasado</option>
            <option value="quitado">Quitado</option>
          </select>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-lg font-semibold">Novo bloco</h2>
          <div className="mt-3 grid gap-2">
            <input className="input" placeholder="Nome" value={forms.bloco.nome} onChange={(e) => formChange("bloco", "nome", e.target.value)} />
            <input
              className="input"
              placeholder="Descrição"
              value={forms.bloco.descricao}
              onChange={(e) => formChange("bloco", "descricao", e.target.value)}
            />
            <input
              className="input"
              placeholder="Valor base"
              value={forms.bloco.valor_base}
              onChange={(e) => formChange("bloco", "valor_base", e.target.value)}
            />
            <button
              className="btn-primary"
              onClick={() =>
                submitForm("bloco", "/api/blocos", {
                  ...forms.bloco,
                  universidade_id: university.id,
                  status: "ativo"
                }).catch((error) => alert(error.message))
              }
            >
              Salvar bloco
            </button>
          </div>
        </article>

        <article className="card p-4">
          <h2 className="text-lg font-semibold">Novo cliente</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <input className="input" placeholder="Nome" value={forms.cliente.nome} onChange={(e) => formChange("cliente", "nome", e.target.value)} />
            <input className="input" placeholder="Curso" value={forms.cliente.curso} onChange={(e) => formChange("cliente", "curso", e.target.value)} />
            <input className="input" placeholder="Tipo" value={forms.cliente.tipo} onChange={(e) => formChange("cliente", "tipo", e.target.value)} />
            <input className="input" placeholder="Contato (258...)" value={forms.cliente.contato} onChange={(e) => formChange("cliente", "contato", e.target.value)} />
            <select className="input" value={forms.cliente.bloco_id} onChange={(e) => formChange("cliente", "bloco_id", e.target.value)}>
              <option value="">Escolha o bloco...</option>
              {blocos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
            <select className="input" value={forms.cliente.status} onChange={(e) => formChange("cliente", "status", e.target.value)}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <button
              className="btn-primary md:col-span-2"
              onClick={() =>
                submitForm("cliente", "/api/clientes", {
                  ...forms.cliente,
                  universidade_id: university.id,
                  data_entrada: forms.cliente.data_entrada || new Date().toISOString().slice(0, 10)
                }).catch((error) => alert(error.message))
              }
            >
              Salvar cliente
            </button>
          </div>
        </article>

        <article className="card p-4">
          <h2 className="text-lg font-semibold">Novo trabalho</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <select className="input" value={forms.trabalho.cliente_id} onChange={(e) => formChange("trabalho", "cliente_id", e.target.value)}>
              <option value="">Cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <select className="input" value={forms.trabalho.tipo_trabalho} onChange={(e) => formChange("trabalho", "tipo_trabalho", e.target.value)}>
              <option value="forum">Forum</option>
              <option value="avaliacao">Avaliação</option>
              <option value="exame">Exame</option>
            </select>
            <input className="input" type="date" value={forms.trabalho.prazo} onChange={(e) => formChange("trabalho", "prazo", e.target.value)} />
            <select className="input" value={forms.trabalho.status} onChange={(e) => formChange("trabalho", "status", e.target.value)}>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="atrasado">Atrasado</option>
            </select>
            <input className="input" placeholder="Valor" value={forms.trabalho.valor} onChange={(e) => formChange("trabalho", "valor", e.target.value)} />
            <input
              className="input"
              placeholder="Observações"
              value={forms.trabalho.observacoes}
              onChange={(e) => formChange("trabalho", "observacoes", e.target.value)}
            />
            <button
              className="btn-primary md:col-span-2"
              onClick={() => submitForm("trabalho", "/api/trabalhos", forms.trabalho).catch((error) => alert(error.message))}
            >
              Salvar trabalho
            </button>
          </div>
        </article>

        <article className="card p-4">
          <h2 className="text-lg font-semibold">Novo pagamento</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <select className="input" value={forms.pagamento.cliente_id} onChange={(e) => formChange("pagamento", "cliente_id", e.target.value)}>
              <option value="">Cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Valor total"
              value={forms.pagamento.valor_total}
              onChange={(e) => formChange("pagamento", "valor_total", e.target.value)}
            />
            <input
              className="input"
              placeholder="Valor pago"
              value={forms.pagamento.valor_pago}
              onChange={(e) => formChange("pagamento", "valor_pago", e.target.value)}
            />
            <input
              className="input"
              type="date"
              value={forms.pagamento.data_pagamento}
              onChange={(e) => formChange("pagamento", "data_pagamento", e.target.value)}
            />
            <input className="input" placeholder="Método" value={forms.pagamento.metodo} onChange={(e) => formChange("pagamento", "metodo", e.target.value)} />
            <input
              className="input"
              placeholder="Observações"
              value={forms.pagamento.observacoes}
              onChange={(e) => formChange("pagamento", "observacoes", e.target.value)}
            />
            <button
              className="btn-primary md:col-span-2"
              onClick={() => submitForm("pagamento", "/api/pagamentos", forms.pagamento).catch((error) => alert(error.message))}
            >
              Salvar pagamento
            </button>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        <article className="card overflow-auto p-4 xl:col-span-1">
          <h2 className="mb-3 text-lg font-semibold">Clientes</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Contato</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-t border-slate-200">
                  <td className="py-2">{cliente.nome}</td>
                  <td className="py-2">{cliente.status}</td>
                  <td className="py-2">
                    <WhatsAppLink phone={cliente.contato} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card overflow-auto p-4 xl:col-span-1">
          <h2 className="mb-3 text-lg font-semibold">Trabalhos</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Prazo</th>
                <th className="pb-2">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {trabalhos
                .filter((item) => !filters.cliente_id || item.cliente_id === filters.cliente_id)
                .map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="py-2">{item.cliente_nome}</td>
                    <td className="py-2">{item.tipo_trabalho}</td>
                    <td className="py-2">{item.prazo}</td>
                    <td className="py-2">
                      <StatusPill value={item.nivel_alerta} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </article>

        <article className="card overflow-auto p-4 xl:col-span-1">
          <h2 className="mb-3 text-lg font-semibold">Pagamentos</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Pendente</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos
                .filter((item) => !filters.cliente_id || item.cliente_id === filters.cliente_id)
                .map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="py-2">{item.cliente_nome}</td>
                    <td className="py-2">{Number(item.valor_pendente).toFixed(2)} MZN</td>
                    <td className="py-2">
                      <StatusPill value={item.status_pagamento} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </article>
      </section>

      <NoticeToast notice={notice} onClose={() => setNotice(null)} />
      <ConfirmPopup
        open={Boolean(clientToDelete)}
        title="Apagar Cliente"
        message={clientToDelete ? `Deseja apagar o cliente "${clientToDelete.nome}"?` : ""}
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        loading={deletingClient}
        onCancel={() => setClientToDelete(null)}
        onConfirm={confirmDeleteClient}
      />
    </main>
  );
}
