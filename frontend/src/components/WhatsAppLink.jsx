export default function WhatsAppLink({ phone }) {
  if (!phone) return null;
  const clean = String(phone).replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noreferrer"
      className="rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
    >
      WhatsApp
    </a>
  );
}
