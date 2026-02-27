export default function StatusPill({ value }) {
  const map = {
    ok: "bg-emerald-100 text-emerald-700",
    normal: "bg-slate-100 text-slate-700",
    proximo: "bg-amber-100 text-amber-700",
    atencao: "bg-amber-100 text-amber-700",
    critico: "bg-red-100 text-red-700",
    atrasado: "bg-red-100 text-red-700",
    quitado: "bg-emerald-100 text-emerald-700",
    pendente: "bg-yellow-100 text-yellow-800"
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${map[value] || map.normal}`}>
      {value || "normal"}
    </span>
  );
}
