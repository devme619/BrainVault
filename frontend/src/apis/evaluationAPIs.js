import { API_BASE_URL } from "../config/apiConfig";

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

export const organizeNoteTextAPI = async (extractedText, aiOptions = {}) => {
  const payload = {
    extracted_text: extractedText,
    provider: aiOptions.provider || localStorage.getItem("bv_ai_provider") || "custom_ml",
    api_key: aiOptions.apiKey || localStorage.getItem("bv_ai_key") || "",
    model_name: aiOptions.modelName || localStorage.getItem("bv_ai_model") || "brainvault-upsc-ml-v1",
  };

  const response = await fetch(`${API_BASE_URL}/evaluation/organize-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to organize note text with AI");
  }

  return response.json();
};
