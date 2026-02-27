export default function MetricCard({ title, value, tone = "default" }) {
  const tones = {
    default: "bg-white border-slate-200 text-slate-800",
    good: "bg-emerald-50 border-emerald-200 text-emerald-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    danger: "bg-red-50 border-red-200 text-red-900"
  };

  return (
    <div className={`card border p-4 ${tones[tone] || tones.default}`}>
      <p className="text-xs uppercase tracking-wide opacity-75">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
