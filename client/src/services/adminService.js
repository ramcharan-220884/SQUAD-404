import API_BASE from "./api";

export const getStats = async () => {
  const res = await fetch(`${API_BASE}/admin/stats`);
  return res.json();
};

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/admin/users`);
  return res.json();
};

export const updateUserStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const sendNotification = async (data) => {
  const res = await fetch(`${API_BASE}/admin/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};