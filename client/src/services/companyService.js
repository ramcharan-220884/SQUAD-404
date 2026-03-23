import API_BASE, { authFetch } from "./api";

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json.success ? json.data : json;
};

// Profile Management
export const getProfile = async () => {
  const res = await authFetch(`/companies/profile`);
  return handleResponse(res);
};

export const updateProfile = async (data) => {
  const res = await authFetch(`/companies/profile`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

// Job Management
export const getPostedJobs = async () => {
  const res = await authFetch(`/companies/jobs`);
  return handleResponse(res);
};

export const postJob = async (data) => {
  const res = await authFetch(`/companies/jobs`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json; // return full response with success flag
};

// Analytics & Applicants
export const getCompanyStats = async () => {
  const res = await authFetch(`/companies/stats`);
  return handleResponse(res);
};

export const getApplicants = async () => {
  const res = await authFetch(`/companies/applicants`);
  return handleResponse(res);
};

export const updateApplicationStatus = async (applicationId, status) => {
  const res = await authFetch(`/companies/applications/status`, {
    method: "PUT",
    body: JSON.stringify({ applicationId, status })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
};

// Announcements (read-only for companies)
export const getAnnouncements = async () => {
  const res = await authFetch(`/companies/announcements`);
  return handleResponse(res);
};


// Legacy / Auth
export const updateJobDetails = async (data) => {
  return updateProfile(data);
};

export const registerCompany = async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: 'company' })
    });
    return res.json();
};
// Applications Rounds Management
export const getCompanyApplicationRounds = async (applicationId) => {
  const res = await authFetch(`/companies/applications/${applicationId}/rounds`);
  return handleResponse(res);
};

export const createCompanyApplicationRound = async (applicationId, data) => {
  const res = await authFetch(`/companies/applications/${applicationId}/rounds`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateCompanyApplicationRoundStatus = async (roundId, status) => {
  const res = await authFetch(`/companies/rounds/${roundId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
};

