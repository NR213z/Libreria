/**
 * Cliente HTTP liviano para hablar con el servidor Express.
 * El token JWT se guarda en localStorage.
 */

const TOKEN_KEY = "librapedidos_token";

export const tokenStore = {
  get:    ()      => localStorage.getItem(TOKEN_KEY),
  set:    (t)     => localStorage.setItem(TOKEN_KEY, t),
  remove: ()      => localStorage.removeItem(TOKEN_KEY),
  has:    ()      => !!localStorage.getItem(TOKEN_KEY),
};

const buildHeaders = () => ({
  "Content-Type": "application/json",
  ...(tokenStore.get() ? { Authorization: `Bearer ${tokenStore.get()}` } : {}),
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error del servidor");
  return data;
};

export const api = {
  get:    (url)        => fetch(url, { method: "GET",    headers: buildHeaders() }).then(handleResponse),
  post:   (url, body)  => fetch(url, { method: "POST",   headers: buildHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  put:    (url, body)  => fetch(url, { method: "PUT",    headers: buildHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  delete: (url)        => fetch(url, { method: "DELETE", headers: buildHeaders() }).then(handleResponse),
};
