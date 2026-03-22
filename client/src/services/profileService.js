import { authFetch } from "./api";

export const getProfile = async (id) => {
  const res = await authFetch(`/students/${id}`);
  return res.json();
};

export const updateProfile = async (id, data) => {
  const res = await authFetch(`/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};