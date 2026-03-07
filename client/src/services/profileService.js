import API_BASE from "./api";

export const getProfile = async (id) => {
  const res = await fetch(`${API_BASE}/students/${id}`);
  return res.json();
};

export const updateProfile = async (id, data) => {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};