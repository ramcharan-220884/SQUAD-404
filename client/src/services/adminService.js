import API_BASE, { authFetch } from "./api";

// Helper to handle standardized response structure { success, data }
const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  // If success is true and data exists, return data. Otherwise return the whole json object.
  return (json.success && json.data !== undefined) ? json.data : json;
};

export const getStats = async () => {
  const res = await authFetch(`/admin/stats`);
  return handleResponse(res);
};

export const getUsers = async () => {
  const res = await authFetch(`/admin/users`);
  return handleResponse(res);
};

export const getPendingUsers = async () => {
  const res = await authFetch(`/admin/pending-users`);
  return handleResponse(res);
};

export const getPlacementAnalytics = async () => {
  const res = await authFetch(`/admin/placement-analytics`);
  return handleResponse(res);
};

export const approveUser = async (id, type) => {
  const res = await authFetch(`/admin/approve-user`, {
    method: "PUT",
    body: JSON.stringify({ id, type })
  });
  return handleResponse(res);
};

export const rejectUser = async (id, type) => {
  const res = await authFetch(`/admin/reject-user`, {
    method: "DELETE",
    body: JSON.stringify({ id, type })
  });
  return handleResponse(res);
};

export const getAllStudents = async (page = 1, limit = 10) => {
  const res = await authFetch(`/admin/students?page=${page}&limit=${limit}`);
  return handleResponse(res);
};

export const getAllCompanies = async (page = 1, limit = 10) => {
  const res = await authFetch(`/admin/companies?page=${page}&limit=${limit}`);
  return handleResponse(res);
};

export const updatePlacementStatus = async (studentId, status) => {
  const res = await authFetch(`/admin/placement-status`, {
    method: "PUT",
    body: JSON.stringify({ studentId, status })
  });
  return handleResponse(res);
};

/* Announcements */
export const getAnnouncements = async () => {
  const res = await authFetch(`/announcements`);
  return handleResponse(res);
};

export const createAnnouncement = async (data) => {
  const res = await authFetch(`/admin/announcements`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteAnnouncement = async (id) => {
  const res = await authFetch(`/admin/announcements/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};

/* Settings */
export const getSettings = async () => {
  const res = await authFetch(`/admin/settings`);
  return handleResponse(res);
};

export const updateSettings = async (data) => {
  const res = await authFetch(`/admin/settings`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

/* Support Tickets */
export const getTickets = async (priority, status) => {
  let url = `/admin/tickets`;
  const params = [];
  if (priority && priority !== 'All') params.push(`priority=${priority}`);
  if (status && status !== 'All') params.push(`status=${status}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  
  const res = await authFetch(url);
  return handleResponse(res);
};

export const updateTicketStatus = async (id, status) => {
  const res = await authFetch(`/admin/tickets/status`, {
    method: "PUT",
    body: JSON.stringify({ id, status })
  });
  return handleResponse(res);
};

export const reportIssue = async (data) => {
  const res = await authFetch(`/admin/tickets`, {
    method: "POST",
    body: JSON.stringify({ ...data, priority: data.priority || 'Normal' })
  });
  return handleResponse(res);
};

export const getProfile = async () => {
  const res = await authFetch(`/admin/profile`);
  return handleResponse(res);
};

export const updateProfile = async (data) => {
  const res = await authFetch(`/admin/profile`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const changeAdminPassword = async (data) => {
  const res = await authFetch(`/admin/change-password`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

/* Competitions */
export const getAdminCompetitions = async () => {
  const res = await authFetch(`/admin/competitions`);
  return handleResponse(res);
};

export const createCompetition = async (data) => {
  const res = await authFetch(`/admin/competitions`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteCompetition = async (id) => {
  const res = await authFetch(`/admin/competitions/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};

/* Events */
export const getAdminEvents = async () => {
  const res = await authFetch(`/admin/events`);
  return handleResponse(res);
};

export const createEvent = async (data) => {
  const res = await authFetch(`/admin/events`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteEvent = async (id) => {
  const res = await authFetch(`/admin/events/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};

/* Assessments */
export const getAdminAssessments = async () => {
  const res = await authFetch(`/admin/assessments`);
  return handleResponse(res);
};

export const createAssessment = async (data) => {
  const res = await authFetch(`/admin/assessments`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteAssessment = async (id) => {
  const res = await authFetch(`/admin/assessments/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};

/* Interviews */
export const getAdminInterviews = async () => {
  const res = await authFetch(`/admin/interviews`);
  return handleResponse(res);
};

export const createInterview = async (data) => {
  const res = await authFetch(`/admin/interviews`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteInterview = async (id) => {
  const res = await authFetch(`/admin/interviews/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};

export const updateInterview = async (id, data) => {
  const res = await authFetch(`/admin/interviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateStudentAdmin = async (id, data) => {
  const res = await authFetch(`/admin/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateCompanyAdmin = async (id, data) => {
  const res = await authFetch(`/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateAnnouncement = async (id, data) => {
  const res = await authFetch(`/admin/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateCompetition = async (id, data) => {
  const res = await authFetch(`/admin/competitions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateEvent = async (id, data) => {
  const res = await authFetch(`/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateAssessment = async (id, data) => {
  const res = await authFetch(`/admin/assessments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};