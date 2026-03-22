import API_BASE from "./api";

export const googleLoginAPI = async (credential, role) => {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ credential, role }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Google Login failed");
  return result;
};

export const forgotPasswordAPI = async (email, role = 'student') => {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to send reset link");
  return data;
};

export const resetPasswordAPI = async (token, newPassword) => {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to reset password");
  return data;
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};

export const registerUser = async (data) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
};

export const sendOTPAPI = async (email) => {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to send OTP");
  return result;
};