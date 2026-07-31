const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function createNote(payload) {
  try {
    const backendPayload = {
      name: payload.name,
      description: payload.description || "",
      file_url: payload.fileUrl || payload.file_url || null,
      file_type: payload.fileType || payload.file_type || null,
      file_name: payload.fileName || payload.file_name || null,
      extracted_text: payload.extractedText || payload.extracted_text || null,
      text_content: payload.textContent || payload.text_content || null,
    };

    const response = await fetch(`${BASE_URL}/notes/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create note");
    }

    return mapBackendNoteToFrontend(data);
  } catch (err) {
    console.error("Error creating note on backend:", err);
    throw err;
  }
}

export async function updateNoteApi(noteId, payload) {
  try {
    const backendPayload = {
      name: payload.name,
      description: payload.description || "",
      file_url: payload.fileUrl || payload.file_url || null,
      file_type: payload.fileType || payload.file_type || null,
      file_name: payload.fileName || payload.file_name || null,
      extracted_text: payload.extractedText || payload.extracted_text || null,
      text_content: payload.textContent || payload.text_content || null,
    };

    const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to update note");
    }
    return mapBackendNoteToFrontend(data);
  } catch (err) {
    console.error("Error updating note on backend:", err);
    throw err;
  }
}

export async function getNotes() {
  try {
    const response = await fetch(`${BASE_URL}/notes/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.warn("Backend notes API returned non-OK status, returning empty list.");
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map(mapBackendNoteToFrontend);
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch notes from backend, returning empty array:", err);
    return [];
  }
}

function mapBackendNoteToFrontend(note) {
  if (!note) return null;
  return {
    id: note.id,
    user_id: note.user_id,
    name: note.name,
    description: note.description,
    fileUrl: note.file_url || note.fileUrl || null,
    fileType: note.file_type || note.fileType || null,
    fileName: note.file_name || note.fileName || null,
    extractedText: note.extracted_text || note.extractedText || null,
    textContent: note.text_content || note.textContent || null,
  };
}
