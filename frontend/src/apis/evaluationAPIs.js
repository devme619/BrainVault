const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const convertFileToText = async (fileObj) => {
  const formData = new FormData();
  formData.append("file", fileObj);

  const response = await fetch(`${API_BASE_URL}/evaluation/convert-file`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to process document for AI evaluation");
  }

  return response.json();
};
