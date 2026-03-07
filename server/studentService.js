import API_BASE from "./api";

export const registerStudent = async (data) => {
  const response = await fetch(`${API_BASE}/students/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
};