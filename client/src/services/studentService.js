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
  const res = await fetch(`${API_BASE}/applications/student/${id}`);
  return res.json();
};