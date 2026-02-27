export const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizePhone = (value = "") => value.replace(/\D/g, "");

export const applyFilters = (query, filters) => {
  let current = query;

  Object.entries(filters).forEach(([column, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      current = current.eq(column, value);
    }
  });

  return current;
};
