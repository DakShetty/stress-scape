const base = import.meta.env.VITE_API_URL || '';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: 'Invalid server response' };
  }
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.errors = data.errors;
    err.data = data;
    throw err;
  }
  return data;
}

export async function get(path, token) {
  const res = await fetch(`${base}${path}`, {
    headers: { ...authHeaders(token) },
  });
  return handle(res);
}

export async function post(path, body, token) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(body ?? {}),
  });
  return handle(res);
}

export async function patch(path, body, token) {
  const res = await fetch(`${base}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(body ?? {}),
  });
  return handle(res);
}

export async function del(path, token) {
  const res = await fetch(`${base}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
  return handle(res);
}
