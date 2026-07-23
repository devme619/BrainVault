const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function createNote(payload) {
  try {
    const response = await fetch(`${BASE_URL}/notes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create note");
    }

    return data;
  } catch (err) {
    console.error("Error creating note on backend:", err);
    throw err;
  }
}

export async function getNotes() {
  try {
    const response = await fetch(`${BASE_URL}/notes/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Backend notes API returned non-OK status, returning empty list.");
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch notes from backend, returning empty array:", err);
    return [];
  }
}
