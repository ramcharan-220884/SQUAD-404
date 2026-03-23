export const API_BASE = "http://localhost:5000/api";

// In-Memory Storage for Dual-Token Architecture
let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

// CSRF Utility: Parse non-httpOnly symmetric cookie dynamically
const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrfToken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Universal authenticated fetch wrapper
export const authFetch = async (endpoint, options = {}) => {
  try {
    const defaultHeaders = {};

    // Add JSON header only if body is not FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    // Attach in-memory access token natively
    if (currentAccessToken) {
      defaultHeaders["Authorization"] = `Bearer ${currentAccessToken}`;
    }

    // Attach CSRF dynamic token universally automatically to halt hijacking
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      defaultHeaders["x-csrf-token"] = csrfToken;
    }

    const config = {
      ...options,
      credentials: "include", // ALWAYS send the httpOnly cookie
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    let response = await fetch(`${API_BASE}${endpoint}`, config);

    // Dual-Token Automatic Interceptor: If Access Token expired (401), execute rotation
    if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login' && endpoint !== '/auth/logout') {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Important: Transmits httpOnly refresh cookie
          headers: { 
            'Content-Type': 'application/json',
            'x-csrf-token': getCsrfToken() || ''
          }
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.success && refreshData.accessToken) {
          // Token Rotation Success: Cache newly issued token
          currentAccessToken = refreshData.accessToken;
          
          // Transparently retry the exact failed request
          config.headers["Authorization"] = `Bearer ${currentAccessToken}`;
          response = await fetch(`${API_BASE}${endpoint}`, config);
        } else {
          // Refresh totally denied/expired -> Force hard logout
          throw new Error("Session completely expired");
        }
      } catch (rotationError) {
        currentAccessToken = null;
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        sessionStorage.clear();
        window.sessionExpired = true;
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return new Response(JSON.stringify({ success: false, message: "Session expired. Please log in again." }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }



    return response;
  } catch (error) {
    console.error(`API request critically failed on ${endpoint}:`, error);
    throw new Error("Unable to connect to the server. Please check your connection and try again.");
  }
};

export default API_BASE;