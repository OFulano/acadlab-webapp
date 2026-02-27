import { useMemo, useState } from "react";

export default function UniversityGate({ universities, onSelect, onCreate, onDelete }) {
  const [nome, setNome] = useState("");
  const [selected, setSelected] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("");

  const options = useMemo(() => universities.filter((u) => u.status === "ativo"), [universities]);
  const menuItems = [
    { id: "sobre", label: "Sobre Nos" },
    { id: "gerir", label: "Gerir Faculdade" },
    { id: "adicionar", label: "Adicionar Opcao" },
    { id: "contrato", label: "Criar Contrato" }
  ];

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
      <section className="card relative w-full p-8 text-center">
        <div className="absolute right-4 top-4">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰ Menu
          </button>

          {menuOpen && (
            <div className="mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 text-left shadow-lg">
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

        <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <img
            src="/logo-acadlab.png"
            alt="Logo AcadLab Moz"
            className="mx-auto h-28 w-full rounded-xl object-cover object-center md:h-32"
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

        {activePanel === "sobre" && (
          <div className="mx-auto mt-8 w-full max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <h2 className="text-lg font-semibold text-slate-900">Sobre NÓs</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Fundada em 2019, na cidade de Nampula - Moçambique, a AcadLab Moz nasceu com a missão de oferecer
              suporte académico acessível, profissional e de alta qualidade para estudantes de diferentes níveis de
              ensino.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Especializada em produção científica, revisão técnica, normalização académica e orientação metodológica,
              a AcadLab Moz posiciona-se como parceira estratégica no desenvolvimento académico dos seus clientes.
              Trabalhamos com ética, confidencialidade e rigor científico, garantindo resultados alinhados às
              exigências institucionais.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Acreditamos que cada estudante merece apoio adequado para transformar esforço em excelência.
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-900">AcadLab Moz - O Seu Sucesso é a Nossa Tese.</p>
          </div>
        )}

        {activePanel === "gerir" && (
          <div className="mx-auto mt-8 w-full max-w-3xl text-left">
            <h2 className="text-lg font-semibold text-slate-900">Gerir Faculdade</h2>
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
        )}

        {activePanel === "adicionar" && (
          <div className="mx-auto mt-8 w-full max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <h2 className="text-lg font-semibold text-slate-900">Adicionar Opcao</h2>
            <p className="mt-2 text-sm text-slate-600">Espaco reservado para novas opcoes que voce vai enviar.</p>
          </div>
        )}

        {activePanel === "contrato" && (
          <div className="mx-auto mt-8 w-full max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <h2 className="text-lg font-semibold text-slate-900">Criar Contrato</h2>
            <p className="mt-2 text-sm text-slate-600">Modulo em preparacao. Assim que enviar os campos, eu monto tudo.</p>
          </div>
        )}
      </section>
    </main>
  );
}
