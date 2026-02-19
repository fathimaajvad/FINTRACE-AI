import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
});

const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_ENDPOINT || "/upload";
const EXPORT_ENDPOINT = import.meta.env.VITE_EXPORT_ENDPOINT || "/export-rift";

export const uploadTransactionsJson = async (file, parsedJson, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("payload", JSON.stringify(parsedJson));

  const response = await API.post(UPLOAD_ENDPOINT, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
};

export const downloadRiftJson = async (analysisData) => {
  const requestConfig = { responseType: "blob" };

  try {
    const response = await API.post(
      EXPORT_ENDPOINT,
      { detection_result: analysisData },
      requestConfig
    );
    return response.data;
  } catch {
    const response = await API.get(EXPORT_ENDPOINT, requestConfig);
    return response.data;
  }
};
