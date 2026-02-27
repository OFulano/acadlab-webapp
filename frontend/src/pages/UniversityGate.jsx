import { useMemo, useState } from "react";

export default function UniversityGate({ universities, onSelect, onCreate }) {
  const [nome, setNome] = useState("");
  const [selected, setSelected] = useState("");

  const options = useMemo(() => universities.filter((u) => u.status === "ativo"), [universities]);

  const submitUniversity = async (event) => {
    event.preventDefault();
    if (!nome.trim()) return;
    await onCreate({ nome, status: "ativo" });
    setNome("");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-8">
      <section className="card w-full p-8">
        <div className="inline-flex rounded-xl bg-brand-900 p-3">
          <img
            src="/logo-acadlab.png"
            alt="Logo AcadLab Moz"
            className="h-14 w-auto object-contain md:h-16"
          />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Gerenciamento de Clientes</h1>
        <p className="mt-2 text-slate-600">Escolha a universidade para entrar no dashboard ou cadastre uma nova.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Universidade</label>
            <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Selecione...</option>
              {options.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
            <button className="btn-primary mt-3" disabled={!selected} onClick={() => onSelect(selected)}>
              Entrar no Dashboard
            </button>
          </div>

          <form onSubmit={submitUniversity}>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nova universidade</label>
            <input
              className="input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Universidade Zambeze"
            />
            <button className="btn-muted mt-3" type="submit">
              Adicionar universidade
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
