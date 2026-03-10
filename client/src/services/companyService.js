import API_BASE from "./api";

export const getPostedJobs = async () => {
  const res = await fetch(`${API_BASE}/company/jobs`);
  return res.json();
};

export const registerCompany = async (data) => {
  const res = await fetch(`${API_BASE}/companies/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const postJob = async (data) => {
  const res = await fetch(`${API_BASE}/company/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};

export const updateApplicationStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/company/applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  return res.json();
};