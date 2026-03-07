import API_BASE from "./api";

export const registerStudent = async (data) => {
  const res = await fetch(`${API_BASE}/students/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};

export const getAppliedJobs = async (id) => {
  const res = await fetch(`${API_BASE}/students/${id}/applications`);
  return res.json();
};