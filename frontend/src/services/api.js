const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const toQuery = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.append(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

export const api = {
  async get(path, params) {
    const response = await fetch(`${API_URL}${path}${toQuery(params)}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async post(path, body) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async put(path, body) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async delete(path, params) {
    const response = await fetch(`${API_URL}${path}${toQuery(params)}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error(await response.text());
    if (response.status === 204) return null;
    return response.json();
  }
};
