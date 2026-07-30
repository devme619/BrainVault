const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const convertFileToText = async (fileObj, aiOptions = {}) => {
  const formData = new FormData();
  formData.append("file", fileObj);
  
  if (aiOptions.provider) {
    formData.append("provider", aiOptions.provider);
  }
  if (aiOptions.apiKey) {
    formData.append("api_key", aiOptions.apiKey);
  }
  if (aiOptions.modelName) {
    formData.append("model_name", aiOptions.modelName);
  }

  const response = await fetch(`${API_BASE_URL}/evaluation/convert-file`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to process document for AI evaluation");
  }

  return response.json();
};
