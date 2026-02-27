import { useEffect, useMemo, useState } from "react";
import ContractManager from "../components/ContractManager";
import { ConfirmPopup, NoticeToast } from "../components/PrettyPopup";

export default function UniversityGate({ universities, onSelect, onCreate, onDelete }) {
  const [nome, setNome] = useState("");
  const [selected, setSelected] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("");
  const [notice, setNotice] = useState(null);
  const [universityToDelete, setUniversityToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const options = useMemo(() => universities.filter((u) => u.status === "ativo"), [universities]);
  const menuItems = [
    { id: "sobre", label: "Sobre Nos" },
    { id: "gerir", label: "Gerir Faculdade" },
    { id: "adicionar", label: "Adicionar Opcao" },
    { id: "contrato", label: "Criar Contrato" }
  ];

  const showNotice = (type, message) => {
    setNotice({ type, message, ts: Date.now() });
  };

  const submitUniversity = async (event) => {
    event.preventDefault();
    if (!nome.trim()) return;
    await onCreate({ nome, status: "ativo" });
    setNome("");
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const confirmDeleteUniversity = async () => {
    if (!universityToDelete) return;
    try {
      setDeleting(true);
      await onDelete(universityToDelete.id);
      showNotice("success", `Faculdade ${universityToDelete.nome} eliminada com sucesso.`);
      setUniversityToDelete(null);
    } catch (error) {
      showNotice("error", `Falha ao eliminar universidade: ${error.message}`);
    } finally {
      setDeleting(false);
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
            {"\u2630"} Menu
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
            <h2 className="text-lg font-semibold text-slate-900">Sobre N&oacute;s</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Fundada em 2019, na cidade de Nampula - Mo&ccedil;ambique, a AcadLab Moz nasceu com a miss&atilde;o de oferecer
              suporte acad&eacute;mico acess&iacute;vel, profissional e de alta qualidade para estudantes de diferentes n&iacute;veis de
              ensino.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Especializada em produ&ccedil;&atilde;o cient&iacute;fica, revis&atilde;o t&eacute;cnica, normaliza&ccedil;&atilde;o acad&eacute;mica e orienta&ccedil;&atilde;o metodol&oacute;gica,
              a AcadLab Moz posiciona-se como parceira estrat&eacute;gica no desenvolvimento acad&eacute;mico dos seus clientes.
              Trabalhamos com &eacute;tica, confidencialidade e rigor cient&iacute;fico, garantindo resultados alinhados &agrave;s exig&ecirc;ncias institucionais.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Acreditamos que cada estudante merece apoio adequado para transformar esfor&ccedil;o em excel&ecirc;ncia.
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-900">AcadLab Moz - O Seu Sucesso &eacute; a Nossa Tese.</p>
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
                    onClick={() => setUniversityToDelete(u)}
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

        {activePanel === "contrato" && <ContractManager universities={universities} />}

        <NoticeToast notice={notice} onClose={() => setNotice(null)} />
        <ConfirmPopup
          open={Boolean(universityToDelete)}
          title="Eliminar Faculdade"
          message={
            universityToDelete
              ? `Eliminar "${universityToDelete.nome}"? Esta acao remove blocos, clientes, trabalhos e pagamentos vinculados.`
              : ""
          }
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          loading={deleting}
          onCancel={() => setUniversityToDelete(null)}
          onConfirm={confirmDeleteUniversity}
        />
      </section>
    </main>
  );
}
