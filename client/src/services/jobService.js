import API_BASE from "./api";

export const getJobs = async () => {
  const res = await fetch(`${API_BASE}/jobs/all`);
  return res.json();
};

export const applyJob = async (data) => {
  const res = await fetch(`${API_BASE}/applications/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};