import API_BASE, { authFetch } from "./api";

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  // If success is true and data exists, return data. Otherwise return the whole json object.
  return (json.success && json.data !== undefined) ? json.data : json;
};

// Profile Endpoints
export const getProfile = async () => {
  const res = await authFetch(`/students/profile`);
  return handleResponse(res);
};

export const updateProfile = async (data) => {
  const res = await authFetch(`/students/profile`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

// Job Endpoints
export const getAvailableJobs = async () => {
  const res = await authFetch(`/students/jobs`);
  return handleResponse(res);
};

export const applyForJob = async (job_id) => {
  const res = await authFetch(`/applications/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id })
  });
  return handleResponse(res);
};

export const getMyApplications = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("User ID not found");
  const res = await authFetch(`/applications/student/${userId}`);
  return handleResponse(res);
};

// Support/Ticket Endpoints
export const submitTicket = async (data) => {
  const res = await authFetch(`/students/tickets`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

// Announcements
export const getAnnouncements = async () => {
  const res = await authFetch(`/students/announcements`);
  return handleResponse(res);
};

// Events
export const getEvents = async () => {
  const res = await authFetch(`/students/events`);
  return handleResponse(res);
};

export const registerForEvent = async (event_id) => {
  const res = await authFetch(`/students/events/register`, {
    method: "POST",
    body: JSON.stringify({ event_id })
  });
  return handleResponse(res);
};

export const submitEvent = async (data) => {
  const res = await authFetch(`/students/events`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const submitResource = async (data) => {
  const res = await authFetch(`/students/resources`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const getResources = async () => {
  const res = await authFetch(`/students/resources`);
  return handleResponse(res);
};

export const getMySubmissions = async () => {
  const res = await authFetch(`/students/my-submissions`);
  return handleResponse(res);
};


// Competitions
export const getCompetitions = async () => {
  const res = await authFetch(`/students/competitions`);
  return handleResponse(res);
};

export const registerForCompetition = async (competition_id) => {
  const res = await authFetch(`/students/competitions/register`, {
    method: "POST",
    body: JSON.stringify({ competition_id })
  });
  return handleResponse(res);
};

export const submitCompetition = async (data) => {
  const res = await authFetch(`/students/competitions`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

// Assessments
export const getAssessments = async () => {
  const res = await authFetch(`/students/assessments`);
  return handleResponse(res);
};

export const updateAssessmentStatus = async (assessment_id, status, score = null) => {
  const res = await authFetch(`/students/assessments/status`, {
    method: "POST",
    body: JSON.stringify({ assessment_id, status, score })
  });
  return handleResponse(res);
};

export const withdrawApplication = async (id) => {
  const res = await authFetch(`/students/applications/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
};

export const getInterviews = async () => {
  const res = await authFetch(`/students/interviews`);
  return handleResponse(res);
};

export const getSettings = async () => {
  const res = await authFetch(`/students/settings`);
  return handleResponse(res);
};

// Legacy support (to avoid immediate breakage while refactoring dashboards)
export const getAppliedJobs = async (id) => getMyApplications();
export const registerStudent = async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: 'student' })
    });
    return res.json();
};
export const getStudentApplicationRounds = async (applicationId) => {
  const res = await authFetch(`/students/applications/${applicationId}/rounds`);
  return handleResponse(res);
};

// Notification Endpoints
export const getNotifications = async () => {
  const res = await authFetch(`/students/notifications`);
  return handleResponse(res);
};

export const markNotificationRead = async (id) => {
  const res = await authFetch(`/students/notifications/${id}/read`, { method: "PATCH" });
  return handleResponse(res);
};
