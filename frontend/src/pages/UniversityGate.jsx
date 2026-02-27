import { useMemo, useState } from "react";

export default function UniversityGate({ universities, onSelect, onCreate, onDelete }) {
  const [nome, setNome] = useState("");
  const [selected, setSelected] = useState("");

  const options = useMemo(() => universities.filter((u) => u.status === "ativo"), [universities]);

  const submitUniversity = async (event) => {
    event.preventDefault();
    if (!nome.trim()) return;
    await onCreate({ nome, status: "ativo" });
    setNome("");
  };

  const handleDelete = async (university) => {
    const confirmed = window.confirm(
      `Eliminar "${university.nome}"? Esta acao remove blocos, clientes, trabalhos e pagamentos vinculados.`
    );
    if (!confirmed) return;

    try {
      await onDelete(university.id);
    } catch (error) {
      alert(`Falha ao eliminar universidade: ${error.message}`);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-8">
      <section className="card w-full p-8 text-center">
        <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <img
            src="/logo-acadlab.png"
            alt="Logo AcadLab Moz"
            className="mx-auto h-24 w-full rounded-xl object-cover object-center md:h-28"
          />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Gerenciamento de Clientes</h1>
        <p className="mt-2 text-slate-600">Escolha a universidade para entrar no dashboard ou cadastre uma nova.</p>

        <div className="mx-auto mt-8 grid w-full max-w-3xl gap-4 md:grid-cols-2">
          <div className="text-left">
            <label className="mb-1 block text-sm font-medium text-slate-700">Universidade</label>
            <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Selecione...</option>
              {options.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
            <button className="btn-primary mt-3 w-full" disabled={!selected} onClick={() => onSelect(selected)}>
              Entrar no Dashboard
            </button>
          </div>

          <form className="text-left" onSubmit={submitUniversity}>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nova universidade</label>
            <input
              className="input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Universidade Zambeze"
            />
            <button className="btn-muted mt-3 w-full" type="submit">
              Adicionar universidade
            </button>
          </form>
        </div>

        <div className="mx-auto mt-8 w-full max-w-3xl text-left">
          <h2 className="text-lg font-semibold text-slate-900">Faculdades cadastradas</h2>
          <div className="mt-3 space-y-2">
            {universities.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{u.nome}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status: {u.status}</p>
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  onClick={() => handleDelete(u)}
                >
                  Eliminar
                </button>
              </div>
            ))}
            {universities.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                Nenhuma universidade cadastrada.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
