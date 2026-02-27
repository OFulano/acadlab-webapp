export function ConfirmPopup({
  open,
  title = "Confirmar acao",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "A processar..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NoticeToast({ notice, onClose }) {
  if (!notice) return null;

  const map = {
    success: "border-emerald-300 bg-emerald-50 text-emerald-900",
    error: "border-red-300 bg-red-50 text-red-900",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
    info: "border-blue-300 bg-blue-50 text-blue-900"
  };

  return (
    <div className="fixed right-4 top-4 z-[110] w-full max-w-sm">
      <div className={`rounded-xl border p-3 shadow-lg ${map[notice.type] || map.info}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium">{notice.message}</p>
          <button type="button" className="text-xs opacity-80 hover:opacity-100" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
