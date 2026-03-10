import API_BASE from "./api";

export const getStats = async () => {
  const res = await fetch(`${API_BASE}/admin/stats`);
  return res.json();
};

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/admin/users`);
  return res.json();
};

export const updateUserStatus = async (id, status, role) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, role })
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

export const getPendingUsers = async () => {
  const res = await fetch(`${API_BASE}/admin/pending-users`);
  if (!res.ok) throw new Error("Failed to fetch pending users");
  return res.json();
};

export const approveUser = async (id, type) => {
  const res = await fetch(`${API_BASE}/admin/approve-user`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, type })
  });
  if (!res.ok) throw new Error("Failed to approve user");
  return res.json();
};

export const rejectUser = async (id, type) => {
  const res = await fetch(`${API_BASE}/admin/reject-user`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, type })
  });
  if (!res.ok) throw new Error("Failed to reject user");
  return res.json();
};