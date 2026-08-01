import { API_BASE_URL, getAuthHeaders } from "../config/apiConfig";

export async function getSubjectTopicsTree() {
  try {
    const response = await fetch(`${API_BASE_URL}/subject-topics/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch subject topics tree:", err);
    return [];
  }
}

export async function createSubjectTopic(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/subject-topics/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to create subject/topic");
    }
    return data;
  } catch (err) {
    console.error("Error creating subject/topic:", err);
    throw err;
  }
}

export async function updateSubjectTopic(id, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/subject-topics/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to update subject/topic");
    }
    return data;
  } catch (err) {
    console.error("Error updating subject/topic:", err);
    throw err;
  }
}

export async function deleteSubjectTopic(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/subject-topics/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete subject/topic");
    }
    return true;
  } catch (err) {
    console.error("Error deleting subject/topic:", err);
    throw err;
  }
}
