// Centralized API Configuration for BrainVault Frontend
// Uses REACT_APP_API_URL environment variable in production (e.g. Vercel/Render)
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

export function getAuthHeaders() {
  const token = localStorage.getItem("bv_token") || localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
